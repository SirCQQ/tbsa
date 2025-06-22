"use client";

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
import { ControlledSelect } from "@/components/ui/inputs/form/controlled-select";
import { ControlledTextarea } from "@/components/ui/inputs/form/controlled-textarea";
import { SelectItem } from "@/components/ui/inputs/form-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  createBuildingSchema,
  type CreateBuildingFormData,
} from "@/lib/validations/building";
import {
  useCreateBuilding,
  isBuildingValidationError,
  getBuildingValidationErrors,
} from "@/hooks/api";
import { BuildingType } from "@prisma/client";

// Building form data type is imported from validations

interface AddBuildingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

const buildingTypeOptions = [
  { value: BuildingType.RESIDENTIAL, label: "Rezidențial" },
  { value: BuildingType.COMMERCIAL, label: "Comercial" },
  { value: BuildingType.MIXED, label: "Mixt (Rezidențial + Comercial)" },
];

export function AddBuildingModal({
  open,
  onOpenChange,
  organizationId: _organizationId,
}: AddBuildingModalProps) {
  // Use a type that matches the form input (before Zod transformation)
  type FormInput = {
    name: string;
    address: string;
    type: BuildingType;
    floors: string | number;
    totalApartments: string | number;
    description?: string;
    readingDay?: string | number;
  };

  const form = useForm<FormInput>({
    resolver: zodResolver(createBuildingSchema),
    defaultValues: {
      name: "",
      address: "",
      type: BuildingType.RESIDENTIAL,
      floors: 1,
      totalApartments: 1,
      description: "",
      readingDay: 15,
    } as CreateBuildingFormData,
  });

  const createBuilding = useCreateBuilding({
    onSuccess: (data) => {
      toast.success(
        `Clădirea "${data.data.name}" a fost adăugată cu succes! Cod: ${data.data.code}`
      );
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      if (isBuildingValidationError(error)) {
        const validationErrors = getBuildingValidationErrors(error);
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof CreateBuildingFormData, {
            message,
          });
        });
      } else {
        toast.error(
          "A apărut o eroare la crearea clădirii. Încercați din nou."
        );
      }
    },
  });

  const onSubmit = (data: FormInput) => {
    // The Zod schema will transform the data to the correct types
    createBuilding.mutate(data as CreateBuildingFormData);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Get floors for display
  const floors = form.watch("floors");
  const floorsNum = typeof floors === "string" ? parseInt(floors, 10) : floors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Adaugă Clădire Nouă
          </DialogTitle>
          <DialogDescription>
            Completați informațiile despre clădirea pe care doriți să o adăugați
            în sistem.
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

              <ControlledSelect
                name="type"
                label="Tip Clădire"
                placeholder="Selectați tipul clădirii"
                required
              >
                {buildingTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </ControlledSelect>
            </div>

            {/* Structure Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Structura clădirii</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ControlledInput
                  name="floors"
                  label="Numărul de etaje"
                  type="number"
                  placeholder="Ex: 4"
                  min={1}
                  max={100}
                  required
                />

                <ControlledInput
                  name="totalApartments"
                  label="Total apartamente"
                  type="number"
                  placeholder="Ex: 20"
                  min={1}
                  max={120}
                  required
                />
              </div>

              <ControlledInput
                name="readingDay"
                label="Ziua de citire"
                type="number"
                placeholder="15"
                min={1}
                max={31}
                helperText="Ziua din lună când se fac citirile (1-31)"
              />

              {/* Building info */}
              {floorsNum > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Clădire cu {floorsNum} etaj{floorsNum > 1 ? "e" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Apartamentele vor fi adăugate separat după crearea clădirii
                  </p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informații suplimentare</h3>

              <ControlledTextarea
                name="description"
                label="Descriere"
                placeholder="Informații suplimentare despre clădire (facilități, anul construcției, etc.)"
                rows={4}
                helperText="Opțional - maxim 500 de caractere"
              />
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
                disabled={createBuilding.isPending}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={createBuilding.isPending}
                borderRadius="full"
              >
                {createBuilding.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Se creează...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Creează Clădirea
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
