"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Validation schema
const buildingSchema = z.object({
  name: z
    .string()
    .min(1, "Numele clădirii este obligatoriu")
    .max(100, "Numele nu poate depăși 100 de caractere"),
  address: z
    .string()
    .min(1, "Adresa este obligatorie")
    .max(200, "Adresa nu poate depăși 200 de caractere"),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL", "MIXED"], {
    required_error: "Tipul clădirii este obligatoriu",
  }),
  floors: z
    .number()
    .min(1, "Numărul de etaje trebuie să fie cel puțin 1")
    .max(50, "Numărul de etaje nu poate depăși 50"),
  apartmentsPerFloor: z
    .number()
    .min(1, "Numărul de apartamente per etaj trebuie să fie cel puțin 1")
    .max(20, "Numărul de apartamente per etaj nu poate depăși 20"),
  description: z
    .string()
    .max(500, "Descrierea nu poate depăși 500 de caractere")
    .optional(),
});

type BuildingFormData = z.infer<typeof buildingSchema>;

interface AddBuildingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

const buildingTypeOptions = [
  { value: "RESIDENTIAL", label: "Rezidențial" },
  { value: "COMMERCIAL", label: "Comercial" },
  { value: "MIXED", label: "Mixt (Rezidențial + Comercial)" },
];

export function AddBuildingModal({
  open,
  onOpenChange,
  organizationId,
}: AddBuildingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "RESIDENTIAL",
      floors: 1,
      apartmentsPerFloor: 1,
      description: "",
    },
  });

  const onSubmit = async (data: BuildingFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Building data:", data);

      // Calculate total apartments
      const totalApartments = data.floors * data.apartmentsPerFloor;

      toast.success(
        `Clădirea "${data.name}" a fost adăugată cu succes! (${totalApartments} apartamente)`
      );

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating building:", error);
      toast.error("A apărut o eroare la crearea clădirii. Încercați din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Calculate total apartments dynamically
  const floors = form.watch("floors");
  const apartmentsPerFloor = form.watch("apartmentsPerFloor");
  const totalApartments =
    floors && apartmentsPerFloor ? floors * apartmentsPerFloor : 0;

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
                  max={50}
                  required
                />

                <ControlledInput
                  name="apartmentsPerFloor"
                  label="Apartamente per etaj"
                  type="number"
                  placeholder="Ex: 4"
                  min={1}
                  max={20}
                  required
                />
              </div>

              {/* Total apartments calculation */}
              {totalApartments > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Total apartamente: {totalApartments}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Se vor crea automat {totalApartments} apartamente numerotate
                    consecutiv
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
                disabled={isSubmitting}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isSubmitting} borderRadius="full">
                {isSubmitting ? (
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
