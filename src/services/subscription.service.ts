import { prisma } from "@/lib/prisma";
import { ServiceResult } from "@/types/api-response";
import { SubscriptionPlan } from "@prisma/client";

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const subscriptionPlans = await prisma.subscriptionPlan.findMany();
  return subscriptionPlans;
};
export const getOrgSubscriptionPlan = async (
  orgId: string
): Promise<ServiceResult<SubscriptionPlan | null>> => {
  const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
    where: {
      organizations: {
        some: {
          id: orgId,
        },
      },
    },
  });

  if (!subscriptionPlan) {
    return {
      success: false,
      error: "Subscription plan not found",
    };
  }
  return {
    data: subscriptionPlan,
    success: true,
    message: "Subscription plan fetched successfully",
  };
};
