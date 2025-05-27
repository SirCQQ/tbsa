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
import { useApartments } from "@/hooks/api/use-apartments";

const createInviteCodeSchema = z.object({
  apartmentId: z.string().min(1, "Selectează un apartament"),
  expiresAt: z.string().optional(),
});

type CreateInviteCodeForm = z.infer<typeof createInviteCodeSchema>;

type CreateInviteCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateInviteCodeModal({
  open,
  onOpenChange,
}: CreateInviteCodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: apartmentsResponse, isLoading: apartmentsLoading } =
    useApartments();
  const createInviteCode = useCreateInviteCode();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateInviteCodeForm>({
    resolver: zodResolver(createInviteCodeSchema),
  });

  const selectedApartmentId = watch("apartmentId");

  // Filter apartments that don't have an owner and don't have an active invite code
  const apartments = apartmentsResponse?.data?.apartments || [];
  const availableApartments = apartments.filter(
    (apartment) => !apartment.ownerId
  );

  const onSubmit = async (data: CreateInviteCodeForm) => {
    try {
      setIsSubmitting(true);

      const payload = {
        data: {
          apartmentId: data.apartmentId,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        },
        administratorId: "admin-id-placeholder",
      };

      await createInviteCode.mutateAsync(payload);

      toast.success("Codul de invitație a fost creat cu succes!");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Nu s-a putut crea codul de invitație");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generează Cod de Invitație</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Apartment Selection */}
          <div className="space-y-2">
            <Label htmlFor="apartmentId">Apartament</Label>
            <Select
              value={selectedApartmentId}
              onValueChange={(value) => setValue("apartmentId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează apartamentul" />
              </SelectTrigger>
              <SelectContent>
                {apartmentsLoading ? (
                  <SelectItem value="" disabled>
                    Se încarcă apartamentele...
                  </SelectItem>
                ) : availableApartments.length === 0 ? (
                  <SelectItem value="" disabled>
                    Nu există apartamente disponibile
                  </SelectItem>
                ) : (
                  availableApartments.map((apartment) => (
                    <SelectItem key={apartment.id} value={apartment.id}>
                      Apartament {apartment.number} - {apartment.building.name}
                    </SelectItem>
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
              disabled={isSubmitting || availableApartments.length === 0}
            >
              {isSubmitting ? "Se creează..." : "Generează Cod"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
