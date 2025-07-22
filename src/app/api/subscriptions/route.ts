import { prisma } from "@/lib/prisma";
import { toSuccessApiResponse } from "@/lib/withAuth";
import { NextRequest } from "next/server";

export const GET = async (_request: NextRequest) => {
  const subscriptions = await prisma.subscriptionPlan.findMany();

  return toSuccessApiResponse(
    {
      data: subscriptions,
      success: true,
      message: "Subscriptions fetched successfully",
    },
    200
  );
};
