"use client";
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
import { useCreateBulkApartments } from "@/hooks/api/use-apartments";
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
  const form = useForm<GenerateApartmentsFormData>({
    resolver: zodResolver(generateApartmentsSchema),
    defaultValues: {
      apartmentsPerFloor: "4",
      startingNumber: "1",
      numberingPattern: "sequential",
    },
  });

  const createBulkApartments = useCreateBulkApartments({
    onSuccess: (response) => {
      const { successCount, errorCount, errors } = response.data;

      if (successCount > 0) {
        toast.success(
          `${successCount} apartamente au fost generate cu succes!`
        );
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} apartamente nu au putut fi create.`);

        // Log detailed errors for debugging
        console.error("Apartment generation errors:", errors);

        // Show first few errors to user
        errors.slice(0, 3).forEach((error) => {
          toast.error(`Apartament ${error.apartment.number}: ${error.error}`);
        });
      }

      if (successCount > 0) {
        form.reset();
        onOpenChange(false);
      }
    },
    onError: (error) => {
      toast.error("A apărut o eroare la generarea apartamentelor.");
      console.error("Bulk generation error:", error);
    },
  });

  const onSubmit = async (data: GenerateApartmentsFormData) => {
    const apartmentsPerFloor = parseInt(data.apartmentsPerFloor, 10);
    const startingNumber = parseInt(data.startingNumber, 10);

    // Generate all apartment data upfront
    const apartments = [];
    let currentNumber = startingNumber;

    // Generate apartments for each floor (0 = ground floor, 1-floors = upper floors)
    for (let floor = 0; floor <= floors; floor++) {
      for (let aptIndex = 0; aptIndex < apartmentsPerFloor; aptIndex++) {
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

        apartments.push({
          number: apartmentNumber,
          floor,
          isOccupied: false,
          occupantCount: 0,
        });
      }
    }

    // Make a single bulk creation request
    createBulkApartments.mutate({
      buildingId,
      apartments,
    });
  };

  const handleCancel = () => {
    if (!createBulkApartments.isPending) {
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
                    Se vor genera {totalApartments} apartamente într-o singură
                    operațiune
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
                {totalApartments} apartamente noi într-o singură cerere.
                Asigurați-vă că numerotarea nu intră în conflict cu
                apartamentele existente.
              </AlertDescription>
            </Alert>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createBulkApartments.isPending}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={createBulkApartments.isPending}
                borderRadius="full"
              >
                {createBulkApartments.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Se generează...
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
