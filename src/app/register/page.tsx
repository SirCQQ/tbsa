"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ControlledInput, FormPasswordInput } from "@/components/ui/inputs";
import { Badge } from "@/components/ui/badge";
import { useRegister } from "@/hooks/use-auth";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";
import type { RegisterRequest, SafeUser } from "@/types/auth";
import { AlertCircle, Building2, CheckCircle } from "lucide-react";
import { RegisterSchema } from "@/schemas/user";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

type RegisterFormData = RegisterRequest;

export default function RegisterPage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  const registerMutation = useRegister();
  const { showRegistrationSuccess, showAuthError } = useAuthFeedback();

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerMutation.mutateAsync(data);

      if (result.user) {
        // Create a SafeUser object for the success message
        const safeUser: SafeUser = {
          ...result.user,
          ownerId: null,
        };
        showRegistrationSuccess(safeUser);
      }

      setSubmitSuccess(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      // Show error using the auth feedback hook
      const errorMessage =
        error instanceof Error ? error.message : "Eroare la înregistrare";
      showAuthError(errorMessage, "Eroare la înregistrare");
      console.error("Registration error:", error);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-background dark:via-background dark:to-blue-900 px-4">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]" />

        <Card className="relative w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Înregistrare reușită!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Contul tău a fost creat cu succes. Vei fi redirecționat către
                pagina de autentificare.
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Sau click aici pentru a te autentifica acum
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-background dark:via-background dark:to-blue-900 px-4 py-8">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                TBSA
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Creează cont nou
          </h1>
          <p className="text-muted-foreground mt-2">
            Completează formularul pentru a te înregistra
          </p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-center">Înregistrare</CardTitle>
            <CardDescription className="text-center">
              Introdu datele tale pentru a crea un cont
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Google Auth Button */}
            <GoogleAuthButton mode="register" className="w-full" />

            {/* Separator */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  sau
                </span>
              </div>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Fields */}
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

                {/* Email Field */}
                <ControlledInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="exemplu@email.com"
                  required
                />

                {/* Phone Field */}
                <ControlledInput
                  name="phone"
                  label="Telefon"
                  placeholder="0712345678"
                />

                {/* Password Field */}
                <FormPasswordInput
                  name="password"
                  control={control}
                  label="Parolă"
                  placeholder="Introduceți parola"
                  required
                />

                {/* Confirm Password Field */}
                <FormPasswordInput
                  name="confirmPassword"
                  control={control}
                  label="Confirmă parola"
                  placeholder="Confirmați parola"
                  required
                />

                {/* Error Message */}
                {registerMutation.error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {registerMutation.error.message}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending
                    ? "Se înregistrează..."
                    : "Creează cont"}
                </Button>

                {/* Terms and Privacy */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Prin crearea contului, accepți{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Termenii și Condițiile
                  </Link>{" "}
                  și{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    Politica de Confidențialitate
                  </Link>
                  .
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ai deja un cont?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Conectează-te aici
            </Link>
          </p>
        </div>

        {/* Role Information */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Despre tipurile de conturi:
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">
                Administrator
              </Badge>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">
                  Pentru administratori de bloc
                </div>
                <div>
                  Poate gestiona apartamentele, citirile și locatarii din blocul
                  administrat
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                Proprietar
              </Badge>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">
                  Pentru proprietari/locatari
                </div>
                <div>
                  Poate vedea informațiile despre apartamentul propriu și să
                  introducă citiri
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
