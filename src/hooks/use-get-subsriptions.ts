import { getEnabledFeatures } from "@/lib/mappers/subscription-features.mapper";
import {
  getSubscriptionIcon,
  getSubscriptionTypeColor,
} from "@/lib/mappers/subscription.mapper";
import { SubscriptionPlan } from "@prisma/client";
import { Building2 } from "lucide-react";
import { useMemo } from "react";
import { useSubscriptions } from "./api/use-subscriptions";
import { SubscriptionFeatures } from "@/types/subscription";

export const useGetSubscriptions = () => {
  const { data: subscriptionsResponse, isLoading, error } = useSubscriptions();

  // Transform API data with icons and prepare for display
  const subscriptions = useMemo(() => {
    if (!subscriptionsResponse?.success || !subscriptionsResponse.data) {
      return [];
    }

    const existingFeatures: string[] = [];

    const data = subscriptionsResponse.data as (SubscriptionPlan & {
      features: SubscriptionFeatures;
    })[];

    return data.map((plan, index) => {
      const enabledFeatures = getEnabledFeatures(
        (plan.features as SubscriptionFeatures) ?? {}
      );
      const featureLabels = Array.isArray(enabledFeatures)
        ? (enabledFeatures
            .map((f) => {
              const label = f.label;
              if (existingFeatures.includes(label)) {
                return null;
              }
              if (label === "Numărul maxim de utilizatori") {
                return `${label}: ${plan?.features?.maxUsers ?? "N/A"}`;
              }
              existingFeatures.push(label);
              console.log(existingFeatures);
              return label;
            })
            .filter(Boolean) as string[])
        : [];

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description || "",
        // Format price for display
        price: Number(plan.price).toString(),
        period: plan.billingInterval || "Lunar",
        popular: plan.popular || false,
        cta: plan.cta || "Începe perioada de probă",
        features: (index === 0
          ? []
          : [`Toate functionalitatile din ${data[index - 1].name}`]
        ).concat(featureLabels),
        // Use Building2 as default icon for now
        icon: plan.subscriptionType
          ? getSubscriptionIcon(plan.subscriptionType)
          : Building2,
        // Default colors
        iconColor: plan.subscriptionType
          ? getSubscriptionTypeColor(plan.subscriptionType)
          : "text-primary",
        color: plan.popular
          ? "from-primary/30 to-purple-500/30"
          : "from-blue-500/20 to-cyan-500/20",
        borderColor: plan.popular ? "border-primary" : "border-blue-500/30",
      };
    });
  }, [subscriptionsResponse]);

  return { subscriptions, isLoading, error };
};
