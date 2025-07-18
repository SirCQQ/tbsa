"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  useRegisterOrganization,
  isValidationError,
  getValidationErrors,
} from "@/hooks/api/use-auth";
import {
  ControlledInput,
  ControlledTextarea,
  ControlledPasswordInput,
} from "@/components/ui/inputs/form";

import {
  organizationRegistrationSchema,
  type OrganizationRegistrationData,
} from "@/lib/validations/auth";

type RegistrationStep = "form" | "success" | "error";

import type { OrganizationRegistrationResponse } from "@/lib/api/auth";

export function OrganizationRegisterForm() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("form");
  const [registrationData, setRegistrationData] =
    useState<OrganizationRegistrationResponse | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const registerOrganization = useRegisterOrganization({
    onSuccess: (data) => {
      setRegistrationData(data);
      setCurrentStep("success");
      toast({
        title: "Înregistrare reușită!",
        description:
          "Contul a fost creat cu succes și vi s-a atribuit rolul de Administrator. Verificați email-ul pentru confirmare.",
      });
    },
    onError: (error) => {
      // Handle form validation errors
      if (isValidationError(error)) {
        const validationErrors = getValidationErrors(error);
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof OrganizationRegistrationData, {
            message,
          });
        });
      }

      setCurrentStep("error");
      setRegistrationData(null);
      toast({
        title: "Eroare la înregistrare",
        description:
          error.response?.data?.error || "A apărut o eroare neașteptată",
        variant: "destructive",
      });
    },
  });

  const form = useForm<OrganizationRegistrationData>({
    resolver: zodResolver(organizationRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: OrganizationRegistrationData) => {
    registerOrganization.mutate(data);
  };

  const handleRetry = () => {
    setCurrentStep("form");
    setRegistrationData(null);
    form.clearErrors();
  };

  // Success state
  if (currentStep === "success" && registrationData?.success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Înregistrare reușită!
          </CardTitle>
          <CardDescription className="text-lg">
            Contul dvs. a fost creat cu succes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Verificați email-ul:</strong> Am trimis un email de
              confirmare la <strong>{registrationData.data.user.email}</strong>.
              Faceți clic pe linkul din email pentru a-vă activa contul.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">
                Utilizator
              </h4>
              <p className="font-medium">
                {registrationData.data.user.firstName}{" "}
                {registrationData.data.user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {registrationData.data.user.email}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/auth/signin")}
              className="w-full"
              borderRadius="full"
            >
              Continuă spre autentificare
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              Înapoi la pagina principală
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (currentStep === "error") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Eroare la înregistrare
          </CardTitle>
          <CardDescription>
            A apărut o problemă în timpul procesului de înregistrare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {registerOrganization.error?.response?.data?.error ||
                "A apărut o eroare neașteptată. Vă rugăm să încercați din nou."}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRetry}
              className="w-full"
              borderRadius="full"
            >
              Încearcă din nou
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              Înapoi la pagina principală
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Form state
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-4">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
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
                placeholder="administrator@asociatia.ro"
                required
              />

              <ControlledInput
                name="phone"
                type="tel"
                label="Telefon"
                placeholder="+40 123 456 789"
              />
            </div>

            {/* Security Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Securitate</h3>

              <ControlledPasswordInput
                name="password"
                label="Parolă"
                placeholder="Introduceți parola"
                helperText="Parola trebuie să aibă cel puțin 8 caractere, o literă mare, o literă mică, o cifră și un caracter special"
                required
                control={form.control}
              />

              <ControlledPasswordInput
                name="confirmPassword"
                label="Confirmă parola"
                placeholder="Confirmați parola"
                required
                control={form.control}
              />
            </div>

            <Separator />

            {/* Terms and Conditions */}
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox
                checked={form.watch("agreeToTerms")}
                onCheckedChange={(checked) =>
                  form.setValue("agreeToTerms", !!checked)
                }
                className="hover:cursor-pointer"
                disabled={registerOrganization.isPending}
              />
              <div className="space-y-1 leading-none">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Accept{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    termenii și condițiile
                  </Link>{" "}
                  și{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    politica de confidențialitate
                  </Link>
                  *
                </label>
                {form.formState.errors.agreeToTerms && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.agreeToTerms.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={registerOrganization.isPending}
              borderRadius="full"
            >
              {registerOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                "Creează contul"
              )}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
