"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { ControlledInput } from "@/components/ui/inputs";
import { OrganizationRegisterForm } from "@/components/auth/organization-register-form";
import {
  userRegistrationSchema,
  type UserRegistrationData,
} from "@/lib/validations/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("organization");

  // User registration form
  const userForm = useForm<UserRegistrationData>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      inviteCode: "",
      phone: "",
      agreeToTerms: false,
    },
  });

  const onUserSubmit = async (data: UserRegistrationData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Înregistrarea a eșuat");
      }

      // Redirect to success page or dashboard
      router.push("/auth/register/success?type=user");
    } catch (error) {
      setError(error instanceof Error ? error.message : "A apărut o eroare");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundGradient className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Înregistrare</CardTitle>
          <CardDescription>
            Creați un cont nou pentru a accesa platforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="organization" className="text-sm">
                Pentru Organizații
              </TabsTrigger>
              <TabsTrigger value="user" className="text-sm">
                Pentru Utilizatori
              </TabsTrigger>
            </TabsList>

            {/* Organization Registration */}
            <TabsContent value="organization" className="space-y-6">
              <OrganizationRegisterForm />
            </TabsContent>

            {/* User Registration */}
            <TabsContent value="user" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-lg font-medium">Înregistrare Utilizator</h3>
                <p className="text-sm text-muted-foreground">
                  Înregistrați-vă cu un cod de invitație primit de la
                  organizația dumneavoastră
                </p>
              </div>

              <FormProvider {...userForm}>
                <form
                  onSubmit={userForm.handleSubmit(onUserSubmit)}
                  className="space-y-4"
                >
                  {/* Invite Code */}
                  <ControlledInput
                    name="inviteCode"
                    label="Cod de Invitație"
                    placeholder="Introduceți codul de invitație"
                    disabled={isLoading}
                    required
                  />

                  <Separator />

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-muted-foreground">
                      Informații Personale
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ControlledInput
                        name="firstName"
                        label="Nume"
                        placeholder="Introduceți numele"
                        disabled={isLoading}
                        required
                      />
                      <ControlledInput
                        name="lastName"
                        label="Prenume"
                        placeholder="Introduceți prenumele"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <ControlledInput
                      name="email"
                      type="email"
                      label="Email"
                      placeholder="email@exemplu.ro"
                      disabled={isLoading}
                      required
                    />

                    <ControlledInput
                      name="phone"
                      type="tel"
                      label="Telefon (Opțional)"
                      placeholder="+40123456789"
                      disabled={isLoading}
                    />
                  </div>

                  <Separator />

                  {/* Password Section */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-muted-foreground">
                      Parolă
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ControlledInput
                        name="password"
                        type="password"
                        label="Parolă"
                        placeholder="Introduceți parola"
                        disabled={isLoading}
                        required
                      />
                      <ControlledInput
                        name="confirmPassword"
                        type="password"
                        label="Confirmă Parola"
                        placeholder="Confirmați parola"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Checkbox
                      checked={userForm.watch("agreeToTerms")}
                      onCheckedChange={(checked) =>
                        userForm.setValue("agreeToTerms", !!checked)
                      }
                      disabled={isLoading}
                    />
                    <div className="space-y-1 leading-none">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Accept&nbsp;
                        <Link
                          href="/terms"
                          className="underline underline-offset-4 hover:text-primary"
                        >
                          termenii și condițiile
                        </Link>
                        &nbsp;și&nbsp;
                        <Link
                          href="/privacy"
                          className="underline underline-offset-4 hover:text-primary"
                        >
                          politica de confidențialitate
                        </Link>
                      </label>
                      {userForm.formState.errors.agreeToTerms && (
                        <p className="text-sm font-medium text-destructive">
                          {userForm.formState.errors.agreeToTerms.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    borderRadius="full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Înregistrează-te
                  </Button>
                </form>
              </FormProvider>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm mt-6">
            <span className="text-muted-foreground">Aveți deja un cont? </span>
            <Link
              href="/auth/signin"
              className="underline underline-offset-4 hover:text-primary"
            >
              Conectați-vă
            </Link>
          </div>
        </CardContent>
      </Card>
    </BackgroundGradient>
  );
}
