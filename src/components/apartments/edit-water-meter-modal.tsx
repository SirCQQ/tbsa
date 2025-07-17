"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ControlledInput,
  ControlledCheckbox,
} from "@/components/ui/inputs/form";
import { useUpdateWaterMeter } from "@/hooks/api/use-water-meters";
import {
  updateWaterMeterSchema,
  type UpdateWaterMeterFormData,
} from "@/lib/validations/water-meter";
import type { WaterMeter } from "@prisma/client/wasm";

type EditWaterMeterModalProps = {
  waterMeter: WaterMeter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditWaterMeterModal({
  waterMeter,
  open,
  onOpenChange,
}: EditWaterMeterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateWaterMeterFormData>({
    resolver: zodResolver(updateWaterMeterSchema),
    defaultValues: {
      serialNumber: waterMeter.serialNumber,
      location: waterMeter.location || "",
      brand: waterMeter.brand || "",
      model: waterMeter.model || "",
      isActive: waterMeter.isActive,
    },
  });

  const updateWaterMeter = useUpdateWaterMeter({
    onSuccess: () => {
      toast.success("Contorul a fost actualizat cu succes");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error updating water meter:", error);
      if (error.message.includes("număr de serie există deja")) {
        form.setError("serialNumber", {
          message:
            "Un contor cu acest număr de serie există deja în organizație",
        });
      } else {
        toast.error(error.message || "Eroare la actualizarea contorului");
      }
    },
  });

  const onSubmit = async (data: UpdateWaterMeterFormData) => {
    setIsSubmitting(true);
    try {
      await updateWaterMeter.mutateAsync({
        id: waterMeter.id,
        data,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editează Contorul de Apă</DialogTitle>
          <DialogDescription>
            Actualizează informațiile contorului de apă pentru acest apartament.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ControlledInput
              name="serialNumber"
              label="Număr Serie"
              placeholder="ex: ABC123456"
              required
            />

            <ControlledInput
              name="location"
              label="Locația în Apartament"
              placeholder="ex: Bucătărie, Baie"
            />

            <div className="grid grid-cols-2 gap-4">
              <ControlledInput
                name="brand"
                label="Marca"
                placeholder="ex: Honeywell"
              />

              <ControlledInput
                name="model"
                label="Model"
                placeholder="ex: W2000"
              />
            </div>

            <ControlledCheckbox
              name="isActive"
              label="Contor Activ"
              helperText="Contoarele inactive nu pot înregistra citiri noi"
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isSubmitting} borderRadius="full">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Se actualizează...
                  </>
                ) : (
                  "Actualizează Contorul"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
