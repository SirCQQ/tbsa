import { prisma } from "@/lib/prisma";
import { toSuccessApiResponse } from "@/lib/withAuth";

import { SubscriptionPlan } from "@prisma/client";
import { NextRequest } from "next/server";

export const GET = async (_request: NextRequest) => {
  const subscriptions = await prisma.subscriptionPlan.findMany({
    where: {
      name: {
        not: "Enterprise",
      },
    },
    orderBy: { maxApartments: "asc" },
  });

  return toSuccessApiResponse<SubscriptionPlan[]>(
    {
      data: subscriptions,
      success: true,
      message: "Subscriptions fetched successfully",
    },
    200
  );
};
