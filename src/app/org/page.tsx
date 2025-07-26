"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SubscriptionPlanSelector } from "@/components/landing/subscription-plan-selector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Page } from "@/components/ui/page";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ControlledInput,
  ControlledTextarea,
} from "@/components/ui/inputs/form";

import { useGetSubscriptions } from "@/hooks/use-get-subsriptions";
import {
  useCreateOrganization,
  useCheckOrganizationCode,
  isValidationError,
  getValidationErrors,
} from "@/hooks/api/use-auth";
import {
  organizationCreationSchema,
  type OrganizationCreationData,
} from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/axios";

type FormData = OrganizationCreationData;

const CreateOrgPage = () => {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();
  const [checkCodeEnabled, setCheckCodeEnabled] = useState(false);

  const {
    subscriptions,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
  } = useGetSubscriptions();

  const form = useForm<FormData>({
    resolver: zodResolver(organizationCreationSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      address: "",
      subscriptionPlanId: undefined,
    },
  });

  const watchedCode = form.watch("code");

  // Check organization code availability with debouncing
  const {
    data: codeCheckResponse,
    isFetching: isCheckingCode,
    error: codeCheckError,
  } = useCheckOrganizationCode(watchedCode, {
    enabled: checkCodeEnabled && watchedCode.length >= 3,
  });

  const isCodeAvailable = codeCheckResponse?.data?.available;
  const codeError = codeCheckError
    ? "Eroare la verificarea codului"
    : codeCheckResponse && !codeCheckResponse.data?.available
      ? codeCheckResponse.message || "Codul este deja folosit"
      : null;

  const createOrganization = useCreateOrganization({
    onSuccess: (response) => {
      toast.success("Organizația a fost creată cu succes!");

      // If there's a payment link, redirect to payment
      if (response.data?.paymentLink) {
        window.location.href = response.data.paymentLink;
      } else {
        // Redirect to organization dashboard
        router.push(`/org/${response.data?.organization?.id}/dashboard`);
      }
    },
    onError: (error) => {
      console.error("Organization creation error:", error);

      if (isValidationError(error)) {
        const validationErrors = getValidationErrors(error);
        Object.entries(validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof FormData, {
            message: message as string,
          });
        });
        toast.error("Vă rugăm să corectați erorile din formular");
      } else {
        toast.error(getErrorMessage(error) || "Eroare la crearea organizației");
      }
    },
  });

  const onSubmit = (data: FormData) => {
    // Validation: Ensure organization code is available if checked
    if (checkCodeEnabled && !isCodeAvailable && !codeError) {
      form.setError("code", {
        message: "Verificați disponibilitatea codului organizației",
      });
      return;
    }

    if (checkCodeEnabled && codeError) {
      form.setError("code", {
        message: codeError,
      });
      return;
    }

    createOrganization.mutate({
      ...data,
      subscriptionPlanId: selectedPlanId,
    });
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    form.setValue("subscriptionPlanId", planId);
    form.clearErrors("subscriptionPlanId"); // Clear any previous errors
  };

  const handleCodeBlur = () => {
    if (watchedCode.length >= 3) {
      setCheckCodeEnabled(true);
    }
  };

  const isSubmitDisabled =
    createOrganization.isPending ||
    subscriptionsLoading ||
    (checkCodeEnabled && watchedCode.length >= 3 && !isCodeAvailable);

  return (
    <Page
      display="flex"
      justifyContent="center"
      alignItems="center"
      background="gradient-ocean"
      className="min-h-screen py-8"
    >
      <div className="container max-w-6xl mx-auto px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className=" backdrop-blur-xl ">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  Creează o nouă organizație
                </CardTitle>
                <p className="text-muted-foreground">
                  Completează informațiile pentru a crea organizația ta
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Organization Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Informații organizație
                  </h3>

                  <ControlledInput
                    name="name"
                    label="Numele organizației"
                    placeholder="Ex: Asociația de proprietari Bloc 1"
                    required
                    helperText="Numele complet al asociației de proprietari"
                  />

                  <div className="relative">
                    <ControlledInput
                      name="code"
                      label="Codul organizației"
                      placeholder="Ex: bloc1-sector1"
                      required
                      helperText="Cod unic pentru organizația ta (doar litere, cifre, - și _)"
                      onBlur={handleCodeBlur}
                    />

                    {/* Code availability indicator */}
                    {watchedCode.length >= 3 && (
                      <div className="mt-1 text-sm">
                        {isCheckingCode ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <LoadingSpinner className="w-3 h-3" />
                            Verificăm disponibilitatea...
                          </div>
                        ) : (
                          checkCodeEnabled && (
                            <>
                              {isCodeAvailable ? (
                                <div className="text-green-600">
                                  ✓ Codul este disponibil
                                </div>
                              ) : codeError ? (
                                <div className="text-red-600">
                                  ✗ {codeError}
                                </div>
                              ) : null}
                            </>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <ControlledInput
                    name="address"
                    label="Adresa organizației (opțional)"
                    placeholder="Ex: Strada Florilor nr. 123, Sector 1, București"
                    helperText="Adresa fizică a organizației"
                  />

                  <ControlledTextarea
                    name="description"
                    label="Descriere (opțional)"
                    placeholder="Descriere scurtă a organizației..."
                    helperText="Informații suplimentare despre organizația ta"
                    rows={3}
                  />
                </div>

                {/* Subscription Plans */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Selectează planul de abonament
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Alege planul care se potrivește cel mai bine nevoilor
                    organizației tale. Poți schimba planul oricând din panoul de
                    administrare.
                  </p>

                  <SubscriptionPlanSelector
                    subscriptions={subscriptions || []}
                    selectedPlanId={selectedPlanId}
                    onPlanSelect={handlePlanSelect}
                    isLoading={subscriptionsLoading}
                    error={subscriptionsError}
                  />

                  {/* Plan Selection Feedback */}
                  {selectedPlanId && (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        ✓ Plan selectat:{" "}
                        {
                          subscriptions?.find((s) => s.id === selectedPlanId)
                            ?.name
                        }
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        După crearea organizației veți fi redirecționat pentru
                        plată
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  borderRadius="full"
                  disabled={isSubmitDisabled}
                >
                  {createOrganization.isPending ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Se creează organizația...
                    </>
                  ) : (
                    "Creează organizația"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </Page>
  );
};

export default CreateOrgPage;
