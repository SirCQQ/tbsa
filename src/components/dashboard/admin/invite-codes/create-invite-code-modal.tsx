"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateInviteCode } from "@/hooks/api/use-invite-codes";
import { useApartmentsByBuilding } from "@/hooks/api/use-apartments";
import { useBuildings } from "@/hooks/api/use-buildings";
import type { CreateInviteCodeInput } from "@/types/invite-codes.types";
import type { ApartmentWithRelations } from "@/services/apartment.service";
import {
  CreateInviteCodeFormSchema,
  type CreateInviteCodeFormInput,
} from "@/lib/validations/invite-codes.validations";

type CreateInviteCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Extended form schema to include building selection
const ExtendedCreateInviteCodeFormSchema = CreateInviteCodeFormSchema.extend({
  buildingId: z.string().min(1, "Selectează o clădire"),
});

type ExtendedCreateInviteCodeFormInput = z.infer<
  typeof ExtendedCreateInviteCodeFormSchema
>;

export function CreateInviteCodeModal({
  open,
  onOpenChange,
}: CreateInviteCodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createInviteCode = useCreateInviteCode();

  // Get buildings for the first dropdown
  const { data: buildingsResponse } = useBuildings({
    page: 1,
    limit: 100,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExtendedCreateInviteCodeFormInput>({
    resolver: zodResolver(ExtendedCreateInviteCodeFormSchema),
  });

  const selectedBuildingId = watch("buildingId");
  const selectedApartmentId = watch("apartmentId");

  // Get apartments for the selected building
  const { data: apartmentsResponse } =
    useApartmentsByBuilding(selectedBuildingId);

  const buildings = buildingsResponse?.data?.buildings || [];
  const apartments = apartmentsResponse?.data || [];

  // Group apartments by floor and sort them
  const groupedApartments = apartments.reduce((groups, apartment) => {
    const floor = apartment.floor ?? 0; // Use 0 for ground floor or null floors
    if (!groups[floor]) {
      groups[floor] = [];
    }
    groups[floor].push(apartment);
    return groups;
  }, {} as Record<number, ApartmentWithRelations[]>);

  // Sort floors and apartments within each floor
  const sortedFloors = Object.keys(groupedApartments)
    .map(Number)
    .sort((a, b) => a - b);

  // Sort apartments within each floor by number
  Object.values(groupedApartments).forEach((floorApartments) => {
    floorApartments.sort((a, b) => {
      const numA = parseInt(a.number) || 0;
      const numB = parseInt(b.number) || 0;
      return numA - numB;
    });
  });

  const onSubmit = async (data: ExtendedCreateInviteCodeFormInput) => {
    try {
      setIsSubmitting(true);

      const payload: CreateInviteCodeInput = {
        apartmentId: data.apartmentId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      };

      await createInviteCode.mutateAsync(payload);

      toast.success("Codul de invitație a fost creat cu succes!");
      reset();
      onOpenChange(false);
    } catch (_error) {
      toast.error("Nu s-a putut crea codul de invitație");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClose = () => {
    reset();
    onOpenChange(false);
  };

  // Reset apartment selection when building changes
  const handleBuildingChange = (buildingId: string) => {
    setValue("buildingId", buildingId);
    setValue("apartmentId", ""); // Reset apartment selection
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generează Cod de Invitație</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Building Selection */}
          <div className="space-y-2">
            <Label htmlFor="buildingId">Clădire</Label>
            <Select
              value={selectedBuildingId}
              onValueChange={handleBuildingChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează clădirea" />
              </SelectTrigger>
              <SelectContent>
                {buildings.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Nu există clădiri disponibile
                  </div>
                ) : (
                  buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name} - {building.address}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.buildingId && (
              <p className="text-sm text-destructive">
                {errors.buildingId.message}
              </p>
            )}
          </div>

          {/* Apartment Selection */}
          <div className="space-y-2">
            <Label htmlFor="apartmentId">Apartament</Label>
            <Select
              value={selectedApartmentId}
              onValueChange={(value) => setValue("apartmentId", value)}
              disabled={!selectedBuildingId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedBuildingId
                      ? "Selectează mai întâi o clădire"
                      : "Selectează apartamentul"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedBuildingId ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Selectează mai întâi o clădire
                  </div>
                ) : Object.entries(groupedApartments).length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Nu există apartamente disponibile în această clădire
                  </div>
                ) : (
                  sortedFloors.map((floor) => (
                    <div key={floor}>
                      {/* Floor header */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                        {floor === 0 ? "Parter" : `Etaj ${floor}`}
                      </div>
                      {/* Apartments on this floor */}
                      {groupedApartments[floor].map(
                        (apartment: ApartmentWithRelations) => (
                          <SelectItem key={apartment.id} value={apartment.id}>
                            Apartament {apartment.number}
                            {apartment.rooms && ` - ${apartment.rooms} camere`}
                            {apartment.owner && (
                              <span className="text-muted-foreground">
                                {" "}
                                (Ocupat)
                              </span>
                            )}
                          </SelectItem>
                        )
                      )}
                    </div>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.apartmentId && (
              <p className="text-sm text-destructive">
                {errors.apartmentId.message}
              </p>
            )}
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Data expirării (opțional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              {...register("expiresAt")}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-muted-foreground">
              Dacă nu este specificată, codul nu va expira
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedBuildingId ||
                !selectedApartmentId ||
                buildings.length === 0
              }
            >
              {isSubmitting ? "Se creează..." : "Generează Cod"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
