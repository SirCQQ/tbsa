import { 
  Building2, 
  Crown, 
  Zap,
  Award,
  Gem,
  Star,
  Settings,
  type LucideIcon 
} from "lucide-react";
import { SubscriptionTypeEnum } from "@prisma/client";

// Icon mapping for subscription types
export const subscriptionIconMap: Record<SubscriptionTypeEnum, LucideIcon> = {
  [SubscriptionTypeEnum.Bronze]: Building2,
  [SubscriptionTypeEnum.Silver]: Star,
  [SubscriptionTypeEnum.Gold]: Award,
  [SubscriptionTypeEnum.Platinum]: Zap,
  [SubscriptionTypeEnum.Diamond]: Gem,
  [SubscriptionTypeEnum.Enterprise]: Crown,
  [SubscriptionTypeEnum.Custom]: Settings,
};

// Default icon for unknown subscription types
const DEFAULT_ICON = Building2;

/**
 * Maps a subscription type enum to its corresponding Lucide icon
 * 
 * @param subscriptionType - The subscription type enum value
 * @returns The corresponding Lucide icon component
 * 
 * @example
 * ```typescript
 * const Icon = getSubscriptionIcon(SubscriptionTypeEnum.Gold);
 * return <Icon className="h-6 w-6 text-yellow-500" />;
 * ```
 */
export function getSubscriptionIcon(subscriptionType: SubscriptionTypeEnum): LucideIcon {
  return subscriptionIconMap[subscriptionType] || DEFAULT_ICON;
}

/**
 * Maps subscription plan data to include the icon component
 * 
 * @param plan - Subscription plan object with subscriptionType property
 * @returns Plan data with icon component added
 * 
 * @example
 * ```typescript
 * const planWithIcon = mapSubscriptionPlanToIcon(plan);
 * const Icon = planWithIcon.icon;
 * ```
 */
export function mapSubscriptionPlanToIcon<T extends { subscriptionType: SubscriptionTypeEnum }>(
  plan: T
): T & { icon: LucideIcon } {
  return {
    ...plan,
    icon: getSubscriptionIcon(plan.subscriptionType),
  };
}

/**
 * Maps an array of subscription plans to include icon components
 * 
 * @param plans - Array of subscription plan objects
 * @returns Array of plans with icon components added
 */
export function mapSubscriptionPlansToIcons<T extends { subscriptionType: SubscriptionTypeEnum }>(
  plans: T[]
): (T & { icon: LucideIcon })[] {
  return plans.map(mapSubscriptionPlanToIcon);
}

/**
 * Get subscription type color class based on the type
 * 
 * @param subscriptionType - The subscription type enum value
 * @returns Tailwind color class for the subscription type
 */
export function getSubscriptionTypeColor(subscriptionType: SubscriptionTypeEnum): string {
  const colorMap: Record<SubscriptionTypeEnum, string> = {
    [SubscriptionTypeEnum.Bronze]: "text-amber-600",
    [SubscriptionTypeEnum.Silver]: "text-gray-500",
    [SubscriptionTypeEnum.Gold]: "text-yellow-500",
    [SubscriptionTypeEnum.Platinum]: "text-blue-500",
    [SubscriptionTypeEnum.Diamond]: "text-purple-500",
    [SubscriptionTypeEnum.Enterprise]: "text-indigo-600",
    [SubscriptionTypeEnum.Custom]: "text-gray-600",
  };
  
  return colorMap[subscriptionType] || "text-gray-500";
} 