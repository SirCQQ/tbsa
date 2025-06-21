import { Control } from "react-hook-form";
import { ControlledPasswordInput } from "@/components/ui/inputs/form";
import type { UserRegistrationData } from "@/lib/validations/auth";

type SecuritySectionProps = {
  control: Control<UserRegistrationData>;
};

export function SecuritySection({ control }: SecuritySectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Securitate</h3>

      <ControlledPasswordInput
        name="password"
        label="Parolă"
        placeholder="Introduceți parola"
        helperText="Parola trebuie să aibă cel puțin 8 caractere, o literă mare, o literă mică, o cifră și un caracter special"
        required
        control={control}
      />

      <ControlledPasswordInput
        name="confirmPassword"
        label="Confirmă parola"
        placeholder="Confirmați parola"
        required
        control={control}
      />
    </div>
  );
}
