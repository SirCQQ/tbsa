"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Building2,
  MapPin,
  Hash,
  Home,
  Car,
  Trees,
  ArrowUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreateBuilding } from "@/hooks/api/use-buildings";
import {
  CreateBuildingWithApartmentsSchema,
  type CreateBuildingWithApartmentsData,
} from "@/schemas/building";
import {
  ControlledInput,
  ControlledTextarea,
  ControlledCheckbox,
} from "@/components/ui/inputs";

interface CreateBuildingModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateBuildingModal({
  trigger,
  onSuccess,
}: CreateBuildingModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createBuilding = useCreateBuilding();

  const methods = useForm({
    resolver: zodResolver(CreateBuildingWithApartmentsSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      postalCode: "",
      readingDeadline: 25,
      floors: undefined,
      totalApartments: undefined,
      yearBuilt: undefined,
      description: "",
      hasElevator: false,
      hasParking: false,
      hasGarden: false,
      autoGenerateApartments: false,
      apartmentsPerFloor: undefined,
      apartments: [],
    },
  });

  const { handleSubmit, watch, reset } = methods;

  const watchAutoGenerate = watch("autoGenerateApartments");
  const watchFloors = watch("floors");
  const watchApartmentsPerFloor = watch("apartmentsPerFloor");

  // Calculate total apartments when auto-generating
  const calculatedApartments =
    watchAutoGenerate && watchFloors && watchApartmentsPerFloor
      ? watchFloors * watchApartmentsPerFloor
      : 0;

  const onSubmit = async (data: CreateBuildingWithApartmentsData) => {
    try {
      await createBuilding.mutateAsync(data);

      toast({
        title: "Succes",
        description: "Clădirea a fost creată cu succes!",
      });

      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Error creating building:", error);
    }
  };

  const handleClose = () => {
    if (!createBuilding.isPending) {
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
            Adaugă Clădire
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Adaugă Clădire Nouă
          </DialogTitle>
          <DialogDescription>
            Completează informațiile pentru a crea o nouă clădire rezidențială.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <h3 className="text-lg font-semibold">Informații de Bază</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ControlledInput
                  name="name"
                  label="Numele Clădirii"
                  placeholder="ex: Bloc Primăverii"
                  required
                />

                <ControlledInput
                  name="city"
                  label="Orașul"
                  placeholder="ex: București"
                  required
                />
              </div>

              <ControlledInput
                name="address"
                label="Adresa Completă"
                placeholder="ex: Strada Florilor nr. 15"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ControlledInput
                  name="postalCode"
                  label="Cod Poștal"
                  placeholder="123456"
                  helperText="6 cifre (opțional)"
                />

                <ControlledInput
                  name="readingDeadline"
                  label="Termen Citiri"
                  type="number"
                  min="1"
                  max="31"
                  helperText="Ziua din lună până când se pot trimite citiri"
                />
              </div>
            </div>

            <Separator />

            {/* Building Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-green-600" />
                <h3 className="text-lg font-semibold">Detalii Clădire</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ControlledInput
                  name="floors"
                  label="Numărul de Etaje"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="ex: 4"
                />

                <ControlledInput
                  name="totalApartments"
                  label="Total Apartamente"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="ex: 16"
                />

                <ControlledInput
                  name="yearBuilt"
                  label="Anul Construcției"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear() + 5}
                  placeholder="ex: 2010"
                />
              </div>

              <ControlledTextarea
                name="description"
                label="Descriere / Note"
                placeholder="Informații suplimentare despre clădire..."
                rows={3}
                helperText="Maxim 500 de caractere"
              />
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-purple-600" />
                <h3 className="text-lg font-semibold">Facilități</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ControlledCheckbox
                  name="hasElevator"
                  label={
                    <span className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Lift
                    </span>
                  }
                />

                <ControlledCheckbox
                  name="hasParking"
                  label={
                    <span className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Parcare
                    </span>
                  }
                />

                <ControlledCheckbox
                  name="hasGarden"
                  label={
                    <span className="flex items-center gap-2">
                      <Trees className="h-4 w-4" />
                      Grădină
                    </span>
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Auto-generate Apartments */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                <h3 className="text-lg font-semibold">Generare Apartamente</h3>
              </div>

              <ControlledCheckbox
                name="autoGenerateApartments"
                label="Generează apartamente automat"
                helperText="Creează apartamente bazat pe numărul de etaje și apartamente pe etaj"
              />

              {watchAutoGenerate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <ControlledInput
                    name="apartmentsPerFloor"
                    label="Apartamente pe Etaj"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="ex: 4"
                    required
                  />

                  {calculatedApartments > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        Se vor crea {calculatedApartments} apartamente
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createBuilding.isPending}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={createBuilding.isPending}
                className="min-w-[120px]"
              >
                {createBuilding.isPending
                  ? "Se creează..."
                  : "Creează Clădirea"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
