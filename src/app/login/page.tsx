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
import { useAuth } from "@/contexts/auth-context";
import type { LoginRequest } from "@/types/auth";
import { AlertCircle, Eye, EyeOff, Building2 } from "lucide-react";
import { LoginSchema } from "@/schemas/user";

type LoginFormData = LoginRequest;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: LoginFormData) => {
    clearError();

    const result = await login(data.email, data.password);

    if (result.success) {
      // Redirect to dashboard or home page on successful login
      router.push("/dashboard");
    }
    // Error handling is done automatically by the auth context with visual feedback
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
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
          <h1 className="text-2xl font-bold text-foreground">Conectează-te</h1>
          <p className="text-muted-foreground mt-2">
            Introdu datele tale pentru a accesa contul
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-center">Autentificare</CardTitle>
            <CardDescription className="text-center">
              Introdu datele tale pentru a te conecta
            </CardDescription>
          </CardHeader>

          <CardContent>
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
                <div className="relative">
                  <ControlledInput
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Parolă"
                    placeholder="Introdu parola"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

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
