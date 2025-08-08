"use client";

import { Button } from "@/components/ui/button";
import { useCreateCheckoutSession } from "@/hooks/api/use-stripe";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type SubscriptionUpgradeButtonProps = {
  organizationId: string;
  subscriptionPlanId: string;
  planName: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  className?: string;
};

export function SubscriptionUpgradeButton({
  organizationId,
  subscriptionPlanId,
  children = "Upgrade la Premium",
  variant = "default",
  size = "default",
  disabled = false,
  className,
}: SubscriptionUpgradeButtonProps) {
  const createCheckoutSession = useCreateCheckoutSession({
    onError: (error) => {
      toast.error(`Eroare la inițierea plății: ${error.message}`);
    },
  });

  const handleUpgrade = () => {
    createCheckoutSession.mutate({
      organizationId,
      subscriptionPlanId,
    });
  };

  const isLoading = createCheckoutSession.isPending;

  return (
    <Button
      onClick={handleUpgrade}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={className}
      borderRadius="full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Se încarcă...
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// Alternative button specifically for subscription plans
export function PlanUpgradeButton({
  organizationId,
  plan,
  isCurrentPlan = false,
  className,
}: {
  organizationId: string;
  plan: {
    id: string;
    name: string;
    popular?: boolean;
  };
  isCurrentPlan?: boolean;
  className?: string;
}) {
  if (isCurrentPlan) {
    return (
      <Button
        disabled
        variant="outline"
        size="lg"
        className={className}
        borderRadius="full"
      >
        Plan curent
      </Button>
    );
  }

  return (
    <SubscriptionUpgradeButton
      organizationId={organizationId}
      subscriptionPlanId={plan.id}
      planName={plan.name}
      variant={plan.popular ? "default" : "outline"}
      size="lg"
      className={className}
    >
      {plan.popular ? "Alege Premium" : `Upgrade la ${plan.name}`}
    </SubscriptionUpgradeButton>
  );
}
