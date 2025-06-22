"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ControlledInput,
  ControlledPasswordInput,
} from "@/components/ui/inputs/form";
import { FormHeader } from "./form-header";
import { GoogleAuthButton } from "./google-auth-button";

// Login form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email este obligatoriu")
    .email("Adresa de email nu este validă"),
  password: z
    .string()
    .min(1, "Parola este obligatorie")
    .min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginFormState = "form" | "loading" | "error";

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl = "/" }: LoginFormProps) {
  const [state, setState] = useState<LoginFormState>("form");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setState("loading");
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl,
      });

      if (result?.error) {
        setState("error");
        setError(
          result.error === "CredentialsSignin"
            ? "Email sau parolă incorectă"
            : "A apărut o eroare la autentificare"
        );
        return;
      }

      if (result?.ok) {
        toast.success("Autentificare reușită!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setState("error");
      setError("A apărut o eroare neașteptată");
    }
  };

  const handleRetry = () => {
    setState("form");
    setError("");
    form.reset();
  };

  if (state === "loading") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">
            Se procesează autentificarea...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state === "error") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <FormHeader
            title="Eroare la autentificare"
            description="A apărut o problemă în procesul de autentificare"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
          <Button onClick={handleRetry} className="w-full" borderRadius="full">
            Încearcă din nou
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <FormHeader
          title="Bine ai revenit"
          description="Conectează-te la contul tău pentru a continua"
        />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <ControlledInput
              name="email"
              label="Adresa de email"
              placeholder="nume@exemplu.com"
              type="email"
              required
              autoComplete="email"
            />

            {/* Password Field */}
            <ControlledPasswordInput
              control={form.control}
              name="password"
              label="Parola"
              placeholder="Introdu parola"
              required
              autoComplete="current-password"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              borderRadius="full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Se conectează...
                </>
              ) : (
                "Conectează-te"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Sau continuă cu
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <GoogleAuthButton callbackUrl={callbackUrl} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
