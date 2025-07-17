"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ControlledInput } from "@/components/ui/inputs/form/controlled-input";
import { ControlledTextarea } from "@/components/ui/inputs/form/controlled-textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Save, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  useUpdateBuilding,
  isBuildingValidationError,
  getBuildingValidationErrors,
} from "@/hooks/api/use-buildings";
import type { BuildingWithOrganization } from "@/lib/api/buildings";

// Edit building schema - only editable fields
const editBuildingSchema = z.object({
  name: z.string().min(1, "Numele clădirii este obligatoriu"),
  address: z.string().min(1, "Adresa este obligatorie"),
  floors: z.coerce
    .number()
    .min(1, "Numărul de etaje trebuie să fie cel puțin 1"),
  description: z.string().optional(),
});

type EditBuildingFormData = z.infer<typeof editBuildingSchema>;

type EditBuildingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building: BuildingWithOrganization | null;
};

export function EditBuildingModal({
  open,
  onOpenChange,
  building,
}: EditBuildingModalProps) {
  const form = useForm<EditBuildingFormData>({
    resolver: zodResolver(editBuildingSchema),
    defaultValues: {
      name: building?.name || "",
      address: building?.address || "",
      floors: building?.floors || 1,
      description: building?.description || "",
    },
  });

  // Reset form when building changes
  React.useEffect(() => {
    if (building) {
      form.reset({
        name: building.name,
        address: building.address,
        floors: building.floors,
        description: building.description || "",
      });
    }
  }, [building, form]);

  const updateBuilding = useUpdateBuilding({
    onSuccess: (data) => {
      toast.success(
        `Clădirea "${data.data.name}" a fost actualizată cu succes!`
      );
      onOpenChange(false);
    },
    onError: (error) => {
      if (isBuildingValidationError(error)) {
        const validationErrors = getBuildingValidationErrors(error);
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof EditBuildingFormData, {
            message,
          });
        });
      } else {
        // Check for floor reduction error
        const errorMessage = error.response?.data?.error || error.message;
        if (
          errorMessage.includes("etaje") ||
          errorMessage.includes("apartamente")
        ) {
          form.setError("floors", {
            message: errorMessage,
          });
        } else {
          toast.error(
            "A apărut o eroare la actualizarea clădirii. Încercați din nou."
          );
        }
      }
    },
  });

  const onSubmit = (data: EditBuildingFormData) => {
    if (!building) return;

    updateBuilding.mutate({
      id: building.id,
      data,
    });
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  if (!building) return null;

  // Check if floors are being reduced
  const currentFloors = form.watch("floors");
  const isReducingFloors = currentFloors < building.floors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Editează Clădirea
          </DialogTitle>
          <DialogDescription>
            Modificați informațiile despre clădirea &apos;{building.name}&apos;.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informații de bază</h3>

              <ControlledInput
                name="name"
                label="Nume Clădire"
                placeholder="Ex: Bloc A1, Strada Libertății 25"
                required
              />

              <ControlledInput
                name="address"
                label="Adresă Completă"
                placeholder="Ex: Strada Libertății Nr. 25, Sector 1, București"
                required
              />

              <ControlledInput
                name="floors"
                label="Numărul de etaje"
                type="number"
                placeholder="Ex: 4"
                min={1}
                max={100}
                required
                helperText={
                  building.totalApartments > 0
                    ? `Atenție: Clădirea are ${building.totalApartments} apartamente înregistrate`
                    : "Numărul total de etaje din clădire"
                }
              />

              {/* Warning for floor reduction */}
              {isReducingFloors && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenție!</strong> Reduceți numărul de etaje de la{" "}
                    {building.floors} la {currentFloors}. Această operație poate
                    eșua dacă există apartamente pe etajele care vor fi
                    eliminate.
                  </AlertDescription>
                </Alert>
              )}

              <ControlledTextarea
                name="description"
                label="Descriere"
                placeholder="Informații suplimentare despre clădire"
                rows={4}
                helperText="Opțional - maxim 500 de caractere"
              />
            </div>

            {/* Building Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Informații clădire
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                <p>
                  Cod clădire: <strong>{building.code}</strong>
                </p>
                <p>
                  Total apartamente: <strong>{building.totalApartments}</strong>
                </p>
                <p>
                  Zi citire: <strong>{building.readingDay}</strong> din lună
                </p>
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

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updateBuilding.isPending}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={updateBuilding.isPending}
                borderRadius="full"
              >
                {updateBuilding.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Se salvează...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvează Modificările
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
