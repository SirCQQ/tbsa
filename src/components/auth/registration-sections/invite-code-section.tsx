import { ControlledInput } from "@/components/ui/inputs/form";

export function InviteCodeSection() {
  return (
    <div className="space-y-4">
      <ControlledInput
        name="inviteCode"
        label="Cod de Invitație"
        placeholder="Introduceți codul de invitație"
        required
      />
    </div>
  );
}
