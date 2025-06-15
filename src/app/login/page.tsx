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
import { useAuth } from "@/contexts/auth-context";
import type { LoginRequest } from "@/types/auth";
import { AlertCircle, Building2 } from "lucide-react";
import { LoginSchema } from "@/schemas/user";
import { Separator } from "@/components/ui/separator";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

type LoginFormData = LoginRequest;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      router.push("/");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Eroare la autentificare"
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-background dark:via-background dark:to-blue-900 px-4">
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
            Bine ai revenit!
          </h1>
          <p className="text-muted-foreground mt-2">
            Conectează-te pentru a continua
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-center">Conectare</CardTitle>
            <CardDescription className="text-center">
              Introdu datele tale pentru a te conecta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google Auth Button */}
            <GoogleAuthButton mode="login" className="w-full" />

            {/* Separator */}
            <div className="relative">
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
                {/* Email Field */}
                <ControlledInput
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="exemplu@email.com"
                  required
                  disabled={isLoading}
                />

                {/* Password Field */}
                <FormPasswordInput
                  name="password"
                  control={control}
                  label="Parolă"
                  placeholder="Introdu parola"
                  required
                  disabled={isLoading}
                />

                {/* Error Message - Only show if not using toast notifications */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Se conectează..." : "Conectează-te"}
                </Button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Ai uitat parola?
                  </Link>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nu ai un cont?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Înregistrează-te aici
            </Link>
          </p>
        </div>

        {/* Role Information */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Tipuri de conturi:
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Administrator</Badge>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Gestionează blocurile și apartamentele
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Proprietar</Badge>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Accesează informațiile despre apartament
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
