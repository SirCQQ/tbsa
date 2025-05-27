"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateApartment } from "@/hooks/api/use-apartments";
import { useBuildings } from "@/hooks/api/use-buildings";
import { ApartmentSchema, type ApartmentInput } from "@/schemas/apartment";
import { ControlledInput, ControlledSelect } from "@/components/ui/inputs";
import type { SafeUser } from "@/types/auth";

interface CreateApartmentModalProps {
  user: SafeUser;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateApartmentModal({
  user,
  trigger,
  onSuccess,
}: CreateApartmentModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createApartment = useCreateApartment();

  // Fetch buildings for selection
  const { data: buildingsResponse, isLoading: buildingsLoading } = useBuildings(
    {
      limit: 100, // Get all buildings for selection
    }
  );

  const buildings = buildingsResponse?.data?.buildings || [];

  const methods = useForm<ApartmentInput>({
    resolver: zodResolver(ApartmentSchema),
    defaultValues: {
      number: "",
      floor: 0,
      rooms: 1,
      buildingId: "",
      ownerId: user.owner?.id || undefined,
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: ApartmentInput) => {
    try {
      await createApartment.mutateAsync(data);

      toast({
        title: "Succes",
        description: "Apartamentul a fost adăugat cu succes!",
      });

      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Error creating apartment:", error);
    }
  };

  const handleClose = () => {
    if (!createApartment.isPending) {
      setOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adaugă Apartament
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Adaugă Apartament Nou
          </DialogTitle>
          <DialogDescription>
            Completează informațiile pentru a adăuga un apartament nou.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Building Selection */}
            <ControlledSelect
              name="buildingId"
              label="Clădirea"
              placeholder="Selectează clădirea"
              required
              disabled={buildingsLoading}
            >
              {buildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  {building.name} - {building.address}
                </SelectItem>
              ))}
            </ControlledSelect>

            {/* Apartment Details */}
            <div className="grid grid-cols-2 gap-4">
              <ControlledInput
                name="number"
                label="Numărul Apartamentului"
                placeholder="ex: 12A"
                required
              />

              <ControlledInput
                name="floor"
                label="Etajul"
                type="number"
                placeholder="ex: 2"
                required
              />
            </div>

            <ControlledInput
              name="rooms"
              label="Numărul de Camere"
              type="number"
              placeholder="ex: 3"
              required
            />

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createApartment.isPending}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={createApartment.isPending}
                className="min-w-[120px]"
              >
                {createApartment.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Se salvează...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adaugă
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
