import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StripeService } from "@/services/stripe.service";
import {
  toSuccessApiResponse,
  zodErrorToNextResponse,
  internalServerErrorResponse,
} from "@/lib/withAuth";

const createCheckoutSchema = z.object({
  organizationId: z.uuid(),
  subscriptionPlanId: z.uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCheckoutSchema.parse(body);

    // Create success and cancel URLs
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/org/${validatedData.organizationId}/dashboard?payment=success`;
    const cancelUrl = `${baseUrl}/org/${validatedData.organizationId}/dashboard?payment=cancelled`;

    // Create checkout session
    const checkoutSession = await StripeService.createCheckoutSession({
      organizationId: validatedData.organizationId,
      subscriptionPlanId: validatedData.subscriptionPlanId,
      userId: session.user.id,
      successUrl,
      cancelUrl,
    });

    return toSuccessApiResponse({
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
      success: true,
      message: "Checkout session created successfully",
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    if (error instanceof z.ZodError) {
      return zodErrorToNextResponse(error);
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return internalServerErrorResponse();
  }
}
