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
import { ControlledInput } from "@/components/ui/inputs";
import { Badge } from "@/components/ui/badge";
import { useRegister } from "@/hooks/use-auth";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";
import type { RegisterRequest } from "@/types/auth";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  CheckCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { RegisterSchema } from "@/schemas/user";

type RegisterFormData = RegisterRequest;

export default function RegisterPage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      role: "OWNER",
    },
  });

  const { handleSubmit, setValue, watch } = methods;

  // Watch role field to update UI
  const watchedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerMutation.mutateAsync(data);

      if (result.user) {
        showRegistrationSuccess(result.user);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md shadow-lg">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="w-full max-w-md">
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
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipul contului <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("role", "OWNER")}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        watchedRole === "OWNER"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Users className="h-5 w-5 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                      <div className="text-sm font-medium">Proprietar</div>
                      <div className="text-xs text-gray-500">
                        Apartament/Locuință
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("role", "ADMINISTRATOR")}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        watchedRole === "ADMINISTRATOR"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <UserPlus className="h-5 w-5 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                      <div className="text-sm font-medium">Administrator</div>
                      <div className="text-xs text-gray-500">
                        Gestionează bloc
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <ControlledInput
                    name="firstName"
                    label="Nume"
                    placeholder="Ionescu"
                    required
                    disabled={registerMutation.isPending}
                  />
                  <ControlledInput
                    name="lastName"
                    label="Prenume"
                    placeholder="Ion"
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>

                {/* Email Field */}
                <ControlledInput
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="exemplu@email.com"
                  required
                  disabled={registerMutation.isPending}
                />

                {/* Phone Field */}
                <ControlledInput
                  name="phone"
                  type="tel"
                  label="Telefon (opțional)"
                  placeholder="+40 123 456 789"
                  disabled={registerMutation.isPending}
                />

                {/* Password Field */}
                <div className="relative">
                  <ControlledInput
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Parolă"
                    placeholder="Minimum 6 caractere"
                    required
                    disabled={registerMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={registerMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <ControlledInput
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirmă parola"
                    placeholder="Rescrie parola"
                    required
                    disabled={registerMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={registerMutation.isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

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
