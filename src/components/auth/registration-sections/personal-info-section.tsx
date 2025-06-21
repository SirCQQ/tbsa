import { ControlledInput } from "@/components/ui/inputs/form";

export function PersonalInfoSection() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Informații personale</h3>
      <div className="grid grid-cols-2 gap-4">
        <ControlledInput
          name="firstName"
          label="Prenume"
          placeholder="Introduceți prenumele"
          required
        />
        <ControlledInput
          name="lastName"
          label="Nume"
          placeholder="Introduceți numele"
          required
        />
      </div>

      <ControlledInput
        name="email"
        type="email"
        label="Email"
        placeholder="email@exemplu.ro"
        required
      />

      <ControlledInput
        name="phone"
        type="tel"
        label="Telefon"
        placeholder="+40 123 456 789"
      />
    </div>
  );
}
