import { ControlledPasswordInput } from "@/components/ui/inputs/form";

export function SecuritySection() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Securitate</h3>

      <ControlledPasswordInput
        name="password"
        label="Parolă"
        placeholder="Introduceți parola"
        helperText="Parola trebuie să aibă cel puțin 8 caractere, o literă mare, o literă mică, o cifră și un caracter special"
        required
      />

      <ControlledPasswordInput
        name="confirmPassword"
        label="Confirmă parola"
        placeholder="Confirmați parola"
        required
      />
    </div>
  );
}
