"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  AlertTriangle,
  Edit,
  Home,
  Building2,
  User,
  MapPin,
} from "lucide-react";

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
import { ControlledTextarea } from "@/components/ui/inputs/form/controlled-textarea";
import { ControlledCheckbox } from "@/components/ui/inputs/form/controlled-checkbox";
import { SelectItem } from "@/components/ui/inputs/form-select";

import {
  useUpdateApartment,
  isApartmentValidationError,
  getApartmentValidationErrors,
} from "@/hooks/api/use-apartments";
import { type ApartmentResponse } from "@/lib/api/apartments";
import { ICON_COLOR_MAPPINGS } from "@/lib/constants/icon-colors";
import {
  EditApartmentFormData,
  editApartmentFormSchema,
} from "@/lib/validations/apartment";

type EditApartmentModalProps = {
  apartment: ApartmentResponse;
  buildingMaxFloors: number;
  isOpen: boolean;
  onClose: () => void;
};

export function EditApartmentModal({
  apartment,
  buildingMaxFloors,
  isOpen,
  onClose,
}: EditApartmentModalProps) {
  const [showOccupiedWarning, setShowOccupiedWarning] = useState(false);

  const form = useForm<EditApartmentFormData>({
    resolver: zodResolver(editApartmentFormSchema),
    defaultValues: {
      number: apartment.number,
      floor: apartment.floor.toString(),
      isOccupied: apartment.isOccupied,
      occupantCount: apartment.occupantCount.toString(),
      surface: apartment.surface?.toString() || "",
      description: apartment.description || "",
    },
  });

  const updateApartment = useUpdateApartment({
    onSuccess: (data) => {
      toast.success(
        `Apartamentul ${data.data.number} a fost actualizat cu succes`
      );
      form.reset();
      onClose();
    },
    onError: (error) => {
      if (isApartmentValidationError(error)) {
        const validationErrors = getApartmentValidationErrors(error);
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof EditApartmentFormData, { message });
        });
      } else {
        toast.error("Eroare la actualizarea apartamentului");
      }
    },
  });

  // Generate floor options (from 0 to building max floors)
  const floorOptions = Array.from(
    { length: buildingMaxFloors + 1 },
    (_, i) => ({
      value: i.toString(),
      label: i === 0 ? "Parter" : `Etaj ${i}`,
    })
  );

  // Generate occupant count options (0 to 20)
  const occupantOptions = Array.from({ length: 21 }, (_, i) => ({
    value: i.toString(),
    label: i === 0 ? "Neocupat" : `${i} ${i === 1 ? "persoană" : "persoane"}`,
  }));

  const onSubmit = (data: EditApartmentFormData) => {
    // Check if apartment is occupied and any critical changes are being made
    const criticalChanges = [
      data.number !== apartment.number,
      parseInt(data.floor) !== apartment.floor,
      data.isOccupied !== apartment.isOccupied && !data.isOccupied, // Marking as unoccupied
    ].some(Boolean);

    if (apartment.isOccupied && criticalChanges && !showOccupiedWarning) {
      setShowOccupiedWarning(true);
      return;
    }

    // Transform form data to match API expectations
    const apiData = {
      number: data.number,
      floor: parseInt(data.floor),
      isOccupied: data.isOccupied,
      occupantCount: parseInt(data.occupantCount),
      surface: data.surface ? parseFloat(data.surface) : undefined,
      description: data.description || undefined,
    };

    updateApartment.mutate({
      id: apartment.id,
      data: apiData,
    });
  };

  const handleClose = () => {
    form.reset();
    setShowOccupiedWarning(false);
    onClose();
  };

  const handleProceedWithWarning = () => {
    setShowOccupiedWarning(false);
    const formData = form.getValues();

    // Transform form data to match API expectations
    const apiData = {
      number: formData.number,
      floor: parseInt(formData.floor),
      isOccupied: formData.isOccupied,
      occupantCount: parseInt(formData.occupantCount),
      surface: formData.surface ? parseFloat(formData.surface) : undefined,
      description: formData.description || undefined,
    };

    updateApartment.mutate({
      id: apartment.id,
      data: apiData,
    });
  };

  const isFormChanged = () => {
    const current = form.getValues();
    return (
      current.number !== apartment.number ||
      parseInt(current.floor) !== apartment.floor ||
      current.isOccupied !== apartment.isOccupied ||
      parseInt(current.occupantCount) !== apartment.occupantCount ||
      (current.surface ? parseFloat(current.surface) : undefined) !==
        apartment.surface ||
      (current.description || "") !== (apartment.description || "")
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit
              className={`h-5 w-5 ${ICON_COLOR_MAPPINGS.apartmentPage.apartment}`}
            />
            Editează Apartament {apartment.number}
          </DialogTitle>
          <DialogDescription>
            Modifică informațiile apartamentului. Câmpurile marcate cu * sunt
            obligatorii.
          </DialogDescription>
        </DialogHeader>

        {/* Occupied Warning Alert */}
        {apartment.isOccupied && (
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Atenție:</strong> Acest apartament este ocupat în prezent.
              Modificările pot afecta locatarii existenți. Vă rugăm să procedați
              cu prudență.
            </AlertDescription>
          </Alert>
        )}

        {/* Critical Changes Warning */}
        {showOccupiedWarning && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Confirmare necesară:</strong> Efectuați modificări critice
              la un apartament ocupat. Acest lucru poate afecta locatarii
              actuali. Sunteți sigur că doriți să continuați?
            </AlertDescription>
            <div className="flex gap-2 mt-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleProceedWithWarning}
                disabled={updateApartment.isPending}
              >
                {updateApartment.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Da, continuă
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOccupiedWarning(false)}
              >
                Anulează
              </Button>
            </div>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Home
                  className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.apartment}`}
                />
                <h3 className="font-semibold">Informații de Bază</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ControlledInput
                  name="number"
                  label="Numărul Apartamentului *"
                  placeholder="ex: 1A, 23, etc."
                  helperText="Alfanumeric, maxim 10 caractere"
                />

                <ControlledSelect
                  name="floor"
                  label="Etaj *"
                  placeholder="Selectează etajul"
                >
                  {floorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </ControlledSelect>
              </div>
            </div>

            {/* Occupancy Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <User
                  className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.occupants}`}
                />
                <h3 className="font-semibold">Informații de Ocupare</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ControlledCheckbox
                  name="isOccupied"
                  label="Apartament Ocupat"
                  helperText="Bifează dacă apartamentul este ocupat în prezent"
                />

                <ControlledSelect
                  name="occupantCount"
                  label="Numărul de Ocupanți"
                  placeholder="Selectează numărul de ocupanți"
                >
                  {occupantOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </ControlledSelect>
              </div>
            </div>

            {/* Physical Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <MapPin
                  className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.surface}`}
                />
                <h3 className="font-semibold">Detalii Fizice</h3>
              </div>

              <ControlledInput
                name="surface"
                label="Suprafața (m²)"
                type="number"
                placeholder="ex: 65.5"
                helperText="Opțional, între 1 și 1000 m²"
                step="0.1"
                min="1"
                max="1000"
              />
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2
                  className={`h-4 w-4 ${ICON_COLOR_MAPPINGS.apartmentPage.floor}`}
                />
                <h3 className="font-semibold">Informații Suplimentare</h3>
              </div>

              <ControlledTextarea
                name="description"
                label="Descriere"
                placeholder="Detalii suplimentare despre apartament..."
                helperText="Opțional, maxim 500 de caractere"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateApartment.isPending}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={updateApartment.isPending || !isFormChanged()}
                borderRadius="full"
              >
                {updateApartment.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Actualizează Apartament
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
