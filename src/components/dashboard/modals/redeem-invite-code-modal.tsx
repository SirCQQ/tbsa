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
import { toast } from "sonner";
import { useRedeemInviteCode } from "@/hooks/api/use-invite-codes";

type RedeemInviteCodeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const RedeemInviteCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Codul trebuie să aibă cel puțin 6 caractere")
    .max(8, "Codul trebuie să aibă cel mult 8 caractere")
    .regex(/^[A-Z0-9]+$/, "Codul poate conține doar litere mari și cifre"),
});

type RedeemInviteCodeFormInput = z.infer<typeof RedeemInviteCodeSchema>;

export function RedeemInviteCodeModal({
  open,
  onOpenChange,
}: RedeemInviteCodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redeemInviteCode = useRedeemInviteCode();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RedeemInviteCodeFormInput>({
    resolver: zodResolver(RedeemInviteCodeSchema),
  });

  const onSubmit = async (data: RedeemInviteCodeFormInput) => {
    try {
      setIsSubmitting(true);

      await redeemInviteCode.mutateAsync({
        code: data.code.toUpperCase(),
      });

      toast.success("Apartamentul a fost adăugat cu succes la contul tău!");
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is already handled by the hook
      console.error("Error redeeming invite code:", error);
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
          <DialogTitle>Folosește Cod de Invitație</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Introdu codul de invitație primit de la administrator pentru a-ți
            adăuga apartamentul la cont.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Cod de Invitație</Label>
              <Input
                id="code"
                placeholder="ex: ABC123XY"
                {...register("code")}
                className="uppercase"
                maxLength={8}
                autoComplete="off"
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Se procesează..." : "Folosește Codul"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
