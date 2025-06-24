"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ControlledInput } from "@/components/ui/inputs/form/controlled-input";
import { ControlledSelect } from "@/components/ui/inputs/form/controlled-select";
import { SelectItem } from "@/components/ui/select";
import { useCreateApartment } from "@/hooks/api/use-apartments";
import {
  getApartmentValidationErrors,
  isApartmentValidationError,
} from "@/hooks/api/use-apartments";
import { toast } from "sonner";
import { AlertCircle, Zap, Info } from "lucide-react";

const generateApartmentsSchema = z.object({
  apartmentsPerFloor: z
    .string()
    .min(1, "Numărul de apartamente este obligatoriu")
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1 && num <= 20;
    }, "Numărul de apartamente trebuie să fie între 1 și 20"),
  startingNumber: z
    .string()
    .min(1, "Numărul de început este obligatoriu")
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1 && num <= 999;
    }, "Numărul de început trebuie să fie între 1 și 999"),
  numberingPattern: z.enum(["sequential", "floor_based"], {
    required_error: "Selectați un pattern de numerotare",
  }),
});

type GenerateApartmentsFormData = z.infer<typeof generateApartmentsSchema>;

type GenerateApartmentsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  buildingName: string;
  floors: number;
};

export function GenerateApartmentsModal({
  open,
  onOpenChange,
  buildingId,
  buildingName,
  floors,
}: GenerateApartmentsModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    current: 0,
    total: 0,
    currentFloor: 0,
  });

  const form = useForm<GenerateApartmentsFormData>({
    resolver: zodResolver(generateApartmentsSchema),
    defaultValues: {
      apartmentsPerFloor: "4",
      startingNumber: "1",
      numberingPattern: "sequential",
    },
  });

  const createApartment = useCreateApartment({
    onError: (error) => {
      console.error("Error creating apartment:", error);
    },
  });

  const onSubmit = async (data: GenerateApartmentsFormData) => {
    const apartmentsPerFloor = parseInt(data.apartmentsPerFloor, 10);
    const startingNumber = parseInt(data.startingNumber, 10);
    const totalApartments = apartmentsPerFloor * (floors + 1); // +1 for ground floor

    setIsGenerating(true);
    setGenerationProgress({
      current: 0,
      total: totalApartments,
      currentFloor: 0,
    });

    let currentNumber = startingNumber;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // Generate apartments for each floor (0 = ground floor, 1-floors = upper floors)
      for (let floor = 0; floor <= floors; floor++) {
        setGenerationProgress((prev) => ({
          ...prev,
          currentFloor: floor,
        }));

        for (let aptIndex = 0; aptIndex < apartmentsPerFloor; aptIndex++) {
          try {
            let apartmentNumber: string;

            if (data.numberingPattern === "floor_based") {
              // Floor-based: 101, 102, 103, 201, 202, 203, etc.
              if (floor === 0) {
                apartmentNumber = (aptIndex + 1).toString();
              } else {
                apartmentNumber = `${floor}${(aptIndex + 1).toString().padStart(2, "0")}`;
              }
            } else {
              // Sequential: 1, 2, 3, 4, 5, 6, etc.
              apartmentNumber = currentNumber.toString();
              currentNumber++;
            }

            await createApartment.mutateAsync({
              number: apartmentNumber,
              floor,
              buildingId,
              isOccupied: false,
            });

            successCount++;
          } catch (error: any) {
            errorCount++;
            if (isApartmentValidationError(error)) {
              const validationErrors = getApartmentValidationErrors(error);
              errors.push(
                `Apartament ${currentNumber}: ${Object.values(validationErrors).join(", ")}`
              );
            } else {
              errors.push(`Apartament ${currentNumber}: Eroare neașteptată`);
            }

            if (data.numberingPattern === "sequential") {
              currentNumber++; // Still increment even on error
            }
          }

          setGenerationProgress((prev) => ({
            ...prev,
            current: prev.current + 1,
          }));

          // Small delay to prevent overwhelming the server
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(
          `${successCount} apartamente au fost generate cu succes!`
        );
      }

      if (errorCount > 0) {
        toast.error(
          `${errorCount} apartamente nu au putut fi create. Verificați consolă pentru detalii.`
        );
        console.error("Apartment generation errors:", errors);
      }

      if (successCount > 0) {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("A apărut o eroare la generarea apartamentelor.");
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ current: 0, total: 0, currentFloor: 0 });
    }
  };

  const handleCancel = () => {
    if (!isGenerating) {
      form.reset();
      onOpenChange(false);
    }
  };

  // Calculate preview
  const apartmentsPerFloor = parseInt(
    form.watch("apartmentsPerFloor") || "4",
    10
  );
  const startingNumber = parseInt(form.watch("startingNumber") || "1", 10);
  const numberingPattern = form.watch("numberingPattern");
  const totalApartments = apartmentsPerFloor * (floors + 1);

  const getPreviewNumbers = () => {
    const preview: string[] = [];
    let currentNumber = startingNumber;

    for (let floor = 0; floor <= Math.min(floors, 2); floor++) {
      for (
        let aptIndex = 0;
        aptIndex < Math.min(apartmentsPerFloor, 3);
        aptIndex++
      ) {
        if (numberingPattern === "floor_based") {
          if (floor === 0) {
            preview.push((aptIndex + 1).toString());
          } else {
            preview.push(
              `${floor}${(aptIndex + 1).toString().padStart(2, "0")}`
            );
          }
        } else {
          preview.push(currentNumber.toString());
          currentNumber++;
        }
      }
      if (apartmentsPerFloor > 3) {
        preview.push("...");
      }
    }
    if (floors > 2) {
      preview.push("...");
    }
    return preview;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Generează Apartamente Automat
          </DialogTitle>
          <DialogDescription>
            Generați automat apartamente pentru toate etajele din clădirea
            &apos;{buildingName}&apos;. Acest proces va crea apartamente pentru
            toate etajele (parter + {floors} etaje).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurare Generare</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ControlledInput
                  name="apartmentsPerFloor"
                  label="Apartamente per Etaj"
                  type="number"
                  placeholder="Ex: 4"
                  required
                  min={1}
                  max={20}
                  helperText="Numărul de apartamente pe fiecare etaj"
                />

                <ControlledInput
                  name="startingNumber"
                  label="Numărul de Început"
                  type="number"
                  placeholder="Ex: 1"
                  required
                  min={1}
                  max={999}
                  helperText="Primul număr de apartament"
                />
              </div>

              <ControlledSelect
                name="numberingPattern"
                label="Pattern Numerotare"
                placeholder="Selectați pattern-ul"
                required
              >
                <SelectItem value="sequential">
                  Secvențial (1, 2, 3, 4, 5, 6...)
                </SelectItem>
                <SelectItem value="floor_based">
                  Pe bază de etaj (1, 2, 3, 101, 102, 103, 201...)
                </SelectItem>
              </ControlledSelect>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Previzualizare</h3>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Se vor genera {totalApartments} apartamente în total
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <div className="mb-2">
                    <strong>Clădire:</strong> {buildingName} ({floors + 1}{" "}
                    nivele)
                  </div>
                  <div className="mb-2">
                    <strong>Apartamente per etaj:</strong> {apartmentsPerFloor}
                  </div>
                  <div>
                    <strong>Exemplu numerotare:</strong>{" "}
                    {getPreviewNumbers().join(", ")}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress during generation */}
            {isGenerating && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Progres Generare</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progres general:</span>
                      <span>
                        {generationProgress.current} /{" "}
                        {generationProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(generationProgress.current / generationProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Etaj curent:{" "}
                      {generationProgress.currentFloor === 0
                        ? "Parter"
                        : `Etaj ${generationProgress.currentFloor}`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form errors */}
            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Warning */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenție:</strong> Această operațiune va crea{" "}
                {totalApartments} apartamente noi. Asigurați-vă că numerotarea
                nu intră în conflict cu apartamentele existente.
              </AlertDescription>
            </Alert>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isGenerating}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isGenerating} borderRadius="full">
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generez... ({generationProgress.current}/
                    {generationProgress.total})
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generează {totalApartments} Apartamente
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
