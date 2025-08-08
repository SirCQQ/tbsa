import {
  getSubscriptionIcon,
  getSubscriptionTypeColor,
} from "@/lib/mappers/subscription.mapper";
import {
  SubscriptionBillingIntervalEnum,
  SubscriptionPlan,
} from "@prisma/client";
import { useMemo } from "react";
import { useSubscriptions } from "./api/use-subscriptions";
import { Building2, LucideIcon } from "lucide-react";

export type SubscriptionParsed = {
  id: string;
  name: string;
  description: string;
  price: string;
  period: SubscriptionBillingIntervalEnum;
  popular: boolean;
  cta: string;
  maxApartments: number | null;
  maxBuildings: number | null;
  maxUsers: number | null;
  icon: LucideIcon;
  iconColor: string;
  color: string;
  borderColor: string;
};

export const useGetSubscriptions = () => {
  const { data: subscriptionsResponse, isLoading, error } = useSubscriptions();

  // Transform API data with icons and prepare for display
  const subscriptions = useMemo(() => {
    if (!subscriptionsResponse?.success || !subscriptionsResponse.data) {
      return [];
    }

    const data = subscriptionsResponse.data as SubscriptionPlan[];

    return data.map<SubscriptionParsed>((plan) => {
      return {
        id: plan.id,
        name: plan.name,
        description: plan.description || "",
        // Format price for display
        price: Number(plan.basePrice).toString(),
        period: plan.billingInterval || "Lunar",
        popular: plan.popular || false,
        cta: plan.cta || "Începe perioada de probă",
        maxApartments: plan.maxApartments,
        maxBuildings: plan.maxBuildings,
        maxUsers: plan.maxUsers,
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
