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
import { ControlledCheckbox } from "@/components/ui/inputs/form/controlled-checkbox";
import { SelectItem } from "@/components/ui/inputs/form-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Plus, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import {
  createApartmentSchema,
  type CreateApartmentFormData,
} from "@/lib/validations/apartment";
import {
  useCreateApartment,
  isApartmentValidationError,
  getApartmentValidationErrors,
} from "@/hooks/api";

type AddApartmentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  buildingName: string;
  maxFloor: number;
};

export function AddApartmentModal({
  open,
  onOpenChange,
  buildingId,
  buildingName,
  maxFloor,
}: AddApartmentModalProps) {
  // Use a type that matches the form input (before Zod transformation)
  type FormInput = {
    number: string;
    floor: string | number;
    buildingId: string;
    isOccupied?: boolean;
    surface?: string | number;
    description?: string;
  };

  const form = useForm<FormInput>({
    resolver: zodResolver(createApartmentSchema),
    defaultValues: {
      number: "",
      floor: 0,
      buildingId,
      isOccupied: false,
      surface: "",
      description: "",
    },
  });

  const createApartment = useCreateApartment({
    onSuccess: (data) => {
      toast.success(
        `Apartamentul ${data.data.number} a fost adăugat cu succes!`
      );
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      if (isApartmentValidationError(error)) {
        const validationErrors = getApartmentValidationErrors(error);
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof CreateApartmentFormData, {
            message,
          });
        });
      } else {
        toast.error(
          "A apărut o eroare la crearea apartamentului. Încercați din nou."
        );
      }
    },
  });

  const onSubmit = (data: FormInput) => {
    // Ensure buildingId is set
    const apartmentData = {
      ...data,
      buildingId,
    };
    createApartment.mutate(apartmentData as CreateApartmentFormData);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Generate floor options
  const floorOptions = Array.from({ length: maxFloor + 1 }, (_, i) => ({
    value: i.toString(),
    label: i === 0 ? "Parter" : `Etaj ${i}`,
  }));

  // Get floor for display info
  const selectedFloor = form.watch("floor");
  const floorNum =
    typeof selectedFloor === "string"
      ? parseInt(selectedFloor, 10)
      : selectedFloor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Adaugă Apartament Nou
          </DialogTitle>
          <DialogDescription>
            Adăugați un apartament nou în clădirea &apos;{buildingName}&apos;.
            Completați informațiile despre apartament.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informații de bază</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ControlledInput
                  name="number"
                  label="Numărul Apartamentului"
                  placeholder="Ex: 1, 2A, 101, etc."
                  required
                  helperText="Numărul trebuie să fie unic în această clădire"
                />

                <ControlledSelect
                  name="floor"
                  label="Etaj"
                  placeholder="Selectați etajul"
                  required
                >
                  {floorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </ControlledSelect>
              </div>

              <ControlledInput
                name="surface"
                label="Suprafața (m²)"
                type="number"
                placeholder="Ex: 45.5"
                min={1}
                max={1000}
                step={0.1}
                helperText="Opțional - suprafața în metri pătrați"
              />
            </div>

            {/* Status Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status apartament</h3>

              <ControlledCheckbox
                name="isOccupied"
                label="Apartament ocupat"
                helperText="Bifați dacă apartamentul are deja proprietar/chiriaș"
              />

              {/* Floor info */}
              {!isNaN(floorNum) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Apartament pe{" "}
                      {floorNum === 0 ? "parter" : `etajul ${floorNum}`}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Clădire: {buildingName}
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
                placeholder="Informații suplimentare despre apartament (orientare, particularități, etc.)"
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
                disabled={createApartment.isPending}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={createApartment.isPending}
                borderRadius="full"
              >
                {createApartment.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Se creează...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Creează Apartamentul
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
