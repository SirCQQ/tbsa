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
import { SelectItem } from "@/components/ui/inputs/form-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Plus, AlertCircle, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";

// Validation schema
const inviteSchema = z.object({
  email: z
    .string()
    .min(1, "Adresa de email este obligatorie")
    .email("Adresa de email nu este validă"),
  role: z.enum(["TENANT", "OWNER", "MANAGER"], {
    required_error: "Rolul este obligatoriu",
  }),
  expiryDays: z
    .number()
    .min(1, "Perioada de expirare trebuie să fie cel puțin 1 zi")
    .max(30, "Perioada de expirare nu poate depăși 30 de zile"),
  sendEmail: z.boolean(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface GenerateInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

const roleOptions = [
  { value: "TENANT", label: "Chiriaș" },
  { value: "OWNER", label: "Proprietar" },
  { value: "MANAGER", label: "Administrator Clădire" },
];

const expiryOptions = [
  { value: "1", label: "1 zi" },
  { value: "3", label: "3 zile" },
  { value: "7", label: "1 săptămână" },
  { value: "14", label: "2 săptămâni" },
  { value: "30", label: "1 lună" },
];

export function GenerateInviteModal({
  open,
  onOpenChange,
  organizationId: _orgId,
}: GenerateInviteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "TENANT",
      expiryDays: 7,
      sendEmail: true,
    },
  });

  const generateInviteCode = () => {
    // Generate a random invite code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Invite data:", data);

      // Generate invite code
      const inviteCode = generateInviteCode();
      setGeneratedCode(inviteCode);

      if (data.sendEmail) {
        toast.success(
          `Codul de invitație a fost generat și trimis la ${data.email}!`
        );
      } else {
        toast.success(`Codul de invitație a fost generat cu succes!`);
      }

      // Don't close modal yet - show the generated code
    } catch (error) {
      console.error("Error generating invite:", error);
      toast.error("A apărut o eroare la generarea codului. Încercați din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode);
        setCopiedCode(true);
        toast.success("Codul a fost copiat în clipboard!");
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (_error) {
        toast.error("Nu s-a putut copia codul în clipboard");
      }
    }
  };

  const handleClose = () => {
    form.reset();
    setGeneratedCode(null);
    setCopiedCode(false);
    onOpenChange(false);
  };

  const handleGenerateAnother = () => {
    form.reset();
    setGeneratedCode(null);
    setCopiedCode(false);
  };

  // Calculate expiry date
  const expiryDays = form.watch("expiryDays");
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {generatedCode
              ? "Cod de Invitație Generat"
              : "Generează Cod de Invitație"}
          </DialogTitle>
          <DialogDescription>
            {generatedCode
              ? "Codul de invitație a fost generat cu succes. Puteți să îl copiați și să îl trimiteți utilizatorului."
              : "Completați informațiile pentru a genera un cod de invitație pentru un utilizator nou."}
          </DialogDescription>
        </DialogHeader>

        {generatedCode ? (
          // Success state - show generated code
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Cod generat cu succes!
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200 tracking-wider">
                    {generatedCode}
                  </div>

                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/20"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiat!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiază Codul
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Invite details */}
              <div className="text-left space-y-2 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">Detalii invitație:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {form.getValues("email")}
                  </p>
                  <p>
                    <span className="font-medium">Rol:</span>{" "}
                    {
                      roleOptions.find(
                        (r) => r.value === form.getValues("role")
                      )?.label
                    }
                  </p>
                  <p>
                    <span className="font-medium">Expiră la:</span>{" "}
                    {expiryDate.toLocaleDateString("ro-RO")}
                  </p>
                  <p>
                    <span className="font-medium">Email trimis:</span>{" "}
                    {form.getValues("sendEmail") ? "Da" : "Nu"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateAnother}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generează Altul
              </Button>
              <Button type="button" onClick={handleClose} borderRadius="full">
                Închide
              </Button>
            </div>
          </div>
        ) : (
          // Form state
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email and Role */}
              <div className="space-y-4">
                <ControlledInput
                  name="email"
                  label="Adresa de Email"
                  type="email"
                  placeholder="exemplu@email.com"
                  required
                />

                <ControlledSelect
                  name="role"
                  label="Rol Utilizator"
                  placeholder="Selectați rolul"
                  required
                >
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </ControlledSelect>
              </div>

              {/* Expiry Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Setări de expirare</h3>

                <ControlledSelect
                  name="expiryDays"
                  label="Perioada de valabilitate"
                  placeholder="Selectați perioada"
                  required
                >
                  {expiryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </ControlledSelect>

                {/* Expiry date preview */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Codul va expira la:{" "}
                      {expiryDate.toLocaleDateString("ro-RO")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    {...form.register("sendEmail")}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="sendEmail" className="text-sm font-medium">
                    Trimite codul prin email
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dacă această opțiune este activată, codul va fi trimis automat
                  la adresa specificată.
                </p>
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
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  borderRadius="full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Se generează...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Generează Codul
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
