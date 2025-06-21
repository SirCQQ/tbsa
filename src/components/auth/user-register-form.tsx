"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  FormDescription,
  InviteCodeSection,
  PersonalInfoSection,
  SecuritySection,
  TermsSection,
  SubmitSection,
  ErrorStep,
  SuccessStep,
} from "./registration-sections";

import {
  userRegistrationSchema,
  type UserRegistrationData,
} from "@/lib/validations/auth";
import {
  useRegisterUser,
  isValidationError,
  getValidationErrors,
} from "@/hooks/api/use-auth";
import type { UserRegistrationResponse } from "@/lib/api/auth";

type RegistrationStep = "form" | "success" | "error";

export function UserRegisterForm() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("form");
  const [registrationData, setRegistrationData] =
    useState<UserRegistrationResponse | null>(null);
  const [error, setError] = useState("");

  const { toast } = useToast();

  const form = useForm<UserRegistrationData>({
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

  const registerUser = useRegisterUser({
    onSuccess: (data) => {
      setRegistrationData(data);
      setCurrentStep("success");
      toast({
        title: "Înregistrare reușită!",
        description:
          "Contul a fost creat cu succes. Verificați email-ul pentru confirmare.",
      });
    },
    onError: (error) => {
      // Handle form validation errors
      if (isValidationError(error)) {
        const validationErrors = getValidationErrors(error);
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof UserRegistrationData, {
            message,
          });
        });
        setCurrentStep("form");
      } else {
        setCurrentStep("error");
        setError(
          error.response?.data?.error || "A apărut o eroare neașteptată"
        );
        toast({
          title: "Eroare la înregistrare",
          description:
            error.response?.data?.error || "A apărut o eroare neașteptată",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: UserRegistrationData) => {
    setError("");
    registerUser.mutate(data);
  };

  const handleRetry = () => {
    setCurrentStep("form");
    setRegistrationData(null);
    setError("");
    form.clearErrors();
  };

  // Success state
  if (currentStep === "success" && registrationData?.success) {
    return <SuccessStep registrationData={registrationData} />;
  }

  // Error state
  if (currentStep === "error") {
    return <ErrorStep error={error} onRetry={handleRetry} />;
  }

  // Form state
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-4">
        <FormDescription description="Înregistrați-vă cu un cod de invitație primit de la asociația dumneavoastră" />

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <InviteCodeSection />

            <Separator />

            <PersonalInfoSection />

            <Separator />

            <SecuritySection control={form.control} />

            <Separator />

            <TermsSection form={form} isLoading={registerUser.isPending} />

            <SubmitSection isLoading={registerUser.isPending} />
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
