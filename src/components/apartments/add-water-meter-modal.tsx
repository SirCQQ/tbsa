"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ControlledInput } from "@/components/ui/inputs/form/controlled-input";
import { ControlledCheckbox } from "@/components/ui/inputs/form/controlled-checkbox";

import { useCreateWaterMeter } from "@/hooks/api";
import {
  addWaterMeterFormSchema,
  type AddWaterMeterFormData,
} from "@/lib/validations/water-meter";
import type { ApartmentResponse } from "@/lib/api/apartments";

type ApartmentWithCounts = ApartmentResponse & {
  _count: {
    waterMeters: number;
  };
};

type AddWaterMeterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartment: ApartmentWithCounts;
};

export function AddWaterMeterModal({
  open,
  onOpenChange,
  apartment,
}: AddWaterMeterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddWaterMeterFormData>({
    resolver: zodResolver(addWaterMeterFormSchema),
    defaultValues: {
      serialNumber: "",
      initialValue: "",
      location: "",
      brand: "",
      model: "",
      isActive: true,
    },
  });

  const createWaterMeter = useCreateWaterMeter({
    onSuccess: (data) => {
      toast.success(
        `Contorul ${data.waterMeter.serialNumber} a fost adăugat cu succes!`
      );
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error creating water meter:", error);

      // Handle validation errors with proper type checking
      const errorData = error.response?.data as any;
      if (errorData?.details) {
        const validationErrors = errorData.details as Record<string, string[]>;
        Object.entries(validationErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            form.setError(field as keyof AddWaterMeterFormData, {
              message: messages[0],
            });
          }
        });
      } else {
        const errorMessage =
          errorData?.error || "Eroare la adăugarea contorului";
        toast.error(errorMessage);
      }
    },
  });

  const onSubmit = async (data: AddWaterMeterFormData) => {
    try {
      setIsSubmitting(true);

      // Transform form data to API format
      const transformedData = {
        serialNumber: data.serialNumber.trim(),
        apartmentId: apartment.id,
        initialValue: parseFloat(data.initialValue) || 0,
        location: data.location?.trim() || undefined,
        brand: data.brand?.trim() || undefined,
        model: data.model?.trim() || undefined,
        isActive: data.isActive,
      };

      createWaterMeter.mutate(transformedData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("A apărut o eroare la procesarea formularului");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClose = () => {
    if (!isSubmitting && !createWaterMeter.isPending) {
      form.reset();
      onOpenChange(false);
    }
  };

  const initialValue = form.watch("initialValue");
  const hasInitialValue = initialValue && parseFloat(initialValue) > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">
            Adaugă Contor Apă
          </DialogTitle>

          {/* Apartment Info */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Apartament:
              </span>
              <Badge variant="outline" className="font-medium">
                {apartment.number}
              </Badge>
              <span className="text-sm text-muted-foreground">
                • Etaj {apartment.floor === 0 ? "Parter" : apartment.floor}
              </span>
            </div>

            {apartment._count.waterMeters > 0 && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Apartamentul are deja {apartment._count.waterMeters} contor
                  {apartment._count.waterMeters !== 1 ? "e" : ""}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Informații de bază
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <ControlledInput
                    name="serialNumber"
                    label="Număr de serie"
                    placeholder="ex: WM-2024-001"
                    required
                    helperText="Numărul unic de identificare al contorului"
                  />
                </div>

                <ControlledInput
                  name="initialValue"
                  label="Valoare inițială"
                  placeholder="0"
                  type="number"
                  min="0"
                  max="999999"
                  step="1"
                  required
                  helperText="Valoarea afișată pe contor la instalare"
                />

                <ControlledInput
                  name="location"
                  label="Locație"
                  placeholder="ex: Bucătărie, Baie"
                  helperText="Unde este amplasat contorul în apartament"
                />
              </div>
            </div>

            {/* Manufacturer Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Informații producător (opțional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ControlledInput
                  name="brand"
                  label="Marca"
                  placeholder="ex: Zenner, Sensus"
                />

                <ControlledInput
                  name="model"
                  label="Model"
                  placeholder="ex: MTKD-M, 620M"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Status</h3>

              <ControlledCheckbox
                name="isActive"
                label="Contor activ"
                helperText="Contorul este funcțional și poate fi folosit pentru citiri"
              />
            </div>

            {/* Initial Value Info */}
            {hasInitialValue && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Se va crea automat o citire inițială cu valoarea{" "}
                  {initialValue} pentru acest contor.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || createWaterMeter.isPending}
                className="flex-1 sm:flex-none"
              >
                Anulează
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || createWaterMeter.isPending}
                className="flex-1 sm:flex-none"
                borderRadius="full"
              >
                {(isSubmitting || createWaterMeter.isPending) && (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                )}
                {isSubmitting || createWaterMeter.isPending
                  ? "Se adaugă..."
                  : "Adaugă contor"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
