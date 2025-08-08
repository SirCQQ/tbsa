"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ControlledInput } from "@/components/ui/inputs/form";

import {
  organizationCreationSchema,
  type OrganizationCreationData,
} from "@/lib/validations/auth";
import { useGetSubscriptions } from "@/hooks/use-get-subsriptions";
import { api } from "@/lib/axios";
import { Form } from "../ui/form";

type CreateOrgStep = "plans" | "organization" | "processing" | "payment";

export function CreateOrganizationWithPayment() {
  const [currentStep, setCurrentStep] = useState<CreateOrgStep>("plans");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  // Get subscription plans
  const { subscriptions: plans, isLoading: plansLoading } =
    useGetSubscriptions();

  const form = useForm<OrganizationCreationData>({
    resolver: zodResolver(organizationCreationSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      address: "",
      subscriptionPlanId: "",
    },
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    form.setValue("subscriptionPlanId", planId);
    setCurrentStep("organization");
  };

  const handleCreateOrganization = async (data: OrganizationCreationData) => {
    try {
      setIsCreating(true);
      setCurrentStep("processing");

      // Create organization with selected subscription plan
      const response = await api.post("/auth/register/organization", {
        ...data,
        subscriptionPlanId: selectedPlanId,
      });

      if (response.data.success) {
        const { organization, paymentLink } = response.data.data;

        if (paymentLink) {
          // Redirect to Stripe for payment
          toast({
            title: "Organizația a fost creată!",
            description: "Redirecționare către procesul de plată...",
          });

          // Redirect to Stripe checkout
          window.location.href = paymentLink;
        } else {
          // No payment needed (free plan)
          toast({
            title: "Organizația a fost creată cu succes!",
            description: "Puteți începe să folosiți aplicația.",
          });
          router.push(`/org/${organization.id}/dashboard`);
        }
      }
    } catch (error: any) {
      console.error("Error creating organization:", error);
      setCurrentStep("organization");

      toast({
        title: "Eroare la crearea organizației",
        description:
          error.response?.data?.error || "A apărut o eroare neașteptată",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Step 1: Plan Selection
  if (currentStep === "plans") {
    if (plansLoading) {
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Se încarcă planurile...</span>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Alege un plan de abonament</h1>
          <p className="text-muted-foreground">
            Selectează planul care se potrivește cel mai bine nevoilor tale
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                plan.popular ? "border-primary shadow-md" : ""
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                  Cel mai popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {Number(plan.price) === 0 ? "Gratuit" : `${plan.price} RON`}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Number(plan.price) > 0 && `/ ${plan.period.toLowerCase()}`}
                  </p>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.maxBuildings && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Până la {plan.maxBuildings} clădiri</span>
                    </div>
                  )}
                  {plan.maxApartments && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Până la {plan.maxApartments} apartamente</span>
                    </div>
                  )}
                  {plan.maxUsers && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Până la {plan.maxUsers} utilizatori</span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  borderRadius="full"
                >
                  Selectează {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Organization Details
  if (currentStep === "organization") {
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Detalii organizație</h1>
          <p className="text-muted-foreground">
            Completează informațiile despre organizația ta
          </p>
        </div>

        {selectedPlan && (
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              Plan selectat: <strong>{selectedPlan.name}</strong> -{" "}
              {Number(selectedPlan.price) === 0
                ? "Gratuit"
                : `${selectedPlan.price} RON / ${selectedPlan.period.toLowerCase()}`}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <Card>
            <CardContent className="pt-6">
              <form
                onSubmit={form.handleSubmit(handleCreateOrganization)}
                className="space-y-4"
              >
                <ControlledInput
                  name="name"
                  label="Numele organizației"
                  placeholder="Asociația de Proprietari Exemple"
                  required
                />

                <ControlledInput
                  name="code"
                  label="Cod organizație"
                  placeholder="ap-exemple"
                  helperText="Codul va fi folosit în URL-ul organizației (doar litere, cifre și liniuțe)"
                  required
                />

                <ControlledInput
                  name="description"
                  label="Descriere (opțional)"
                  placeholder="O scurtă descriere a organizației..."
                />

                <ControlledInput
                  name="address"
                  label="Adresa (opțional)"
                  placeholder="Strada Exemplu, Nr. 1, București"
                />

                <Separator />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep("plans")}
                    disabled={isCreating}
                  >
                    Înapoi la planuri
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isCreating}
                    borderRadius="full"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Se procesează...
                      </>
                    ) : Number(selectedPlan?.price || 0) > 0 ? (
                      "Continuă la plată"
                    ) : (
                      "Creează organizația"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Form>
      </div>
    );
  }

  // Step 3: Processing
  if (currentStep === "processing") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Se creează organizația...</h3>
            <p className="text-sm text-muted-foreground">
              Vă rugăm să așteptați, procesul va dura doar câteva secunde.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Usage example component that shows how to use this in a page
export function CreateOrganizationPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <CreateOrganizationWithPayment />
    </div>
  );
}
