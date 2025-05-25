"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "./controlled-input";
import { Save, X } from "lucide-react";
import { SafeUser } from "@/types/auth";

// Validation schema
const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Prenumele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Prenumele nu poate avea mai mult de 50 de caractere"),
  lastName: z
    .string()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numele nu poate avea mai mult de 50 de caractere"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+4|0)[0-9]{9}$/.test(val),
      "Numărul de telefon trebuie să fie valid (ex: 0712345678 sau +40712345678)"
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: SafeUser;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProfileForm({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProfileFormProps) {
  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = methods;

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Form submission error:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ControlledInput
            name="firstName"
            label="Prenume"
            placeholder="Prenumele tău"
            required
            disabled={isLoading}
          />

          <ControlledInput
            name="lastName"
            label="Nume"
            placeholder="Numele tău"
            required
            disabled={isLoading}
          />
        </div>

        <ControlledInput
          name="phone"
          label="Telefon"
          placeholder="Numărul tău de telefon (opțional)"
          type="tel"
          disabled={isLoading}
          helperText="Format acceptat: 0712345678 sau +40712345678"
        />

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isLoading || !isDirty || !isValid}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Se salvează...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvează Modificările
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Anulează
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
