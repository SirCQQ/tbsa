import { NextRequest, NextResponse } from "next/server";
import { stripe, webhookSecret } from "@/lib/stripe";
import { StripeService } from "@/services/stripe.service";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    if (!webhookSecret) {
      console.error("Stripe webhook secret is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
        {
          const subscription = event.data.object as Stripe.Subscription;
          await StripeService.handleSubscriptionCreated(subscription);
          console.log("Subscription created successfully");
        }
        break;

      case "customer.subscription.updated":
        {
          const subscription = event.data.object as Stripe.Subscription;
          // Handle subscription updates (e.g., plan changes, status changes)
          console.log("Subscription updated:", subscription.id);
          // You can add more logic here for handling updates
        }
        break;

      case "customer.subscription.deleted":
        {
          const subscription = event.data.object as Stripe.Subscription;
          await StripeService.handleSubscriptionCanceled(subscription);
          console.log("Subscription canceled successfully");
        }
        break;

      case "invoice.payment_succeeded":
        {
          const invoice = event.data.object as Stripe.Invoice;
          console.log("Payment succeeded for invoice:", invoice.id);
          // You can add logic here to handle successful payments
        }
        break;

      case "invoice.payment_failed":
        {
          const invoice = event.data.object as Stripe.Invoice;
          console.log("Payment failed for invoice:", invoice.id);
          // You can add logic here to handle failed payments
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
