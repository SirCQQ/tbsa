import Stripe from "stripe";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import {
  SubscriptionPlan,
  SubscriptionBillingIntervalEnum,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logging";

export type CreateCheckoutSessionData = {
  organizationId: string;
  subscriptionPlanId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
};

export type StripeCustomerData = {
  email: string;
  name: string;
  organizationId: string;
};

export class StripeService {
  /**
   * Create or retrieve a Stripe customer for an organization
   */
  static async createOrGetCustomer(
    customerData: StripeCustomerData
  ): Promise<Stripe.Customer> {
    try {
      // First, try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerData.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      return await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: {
          organizationId: customerData.organizationId,
        },
      });
    } catch (error) {
      console.error("Error creating/getting Stripe customer:", error);
      throw new Error("Failed to create Stripe customer");
    }
  }

  /**
   * Create or retrieve a Stripe product for a subscription plan
   */
  static async createOrGetProduct(
    plan: SubscriptionPlan
  ): Promise<Stripe.Product> {
    try {
      // Try to find existing product by metadata
      const existingProducts = await stripe.products.list({
        limit: 100,
      });

      const existingProduct = existingProducts.data.find(
        (product) => product.metadata.subscriptionPlanId === plan.id
      );

      if (existingProduct) {
        return existingProduct;
      }

      // Create new product
      return await stripe.products.create({
        name: plan.name,
        description: plan.description || undefined,
        metadata: {
          subscriptionPlanId: plan.id,
        },
      });
    } catch (error) {
      console.error("Error creating/getting Stripe product:", error);
      throw new Error("Failed to create Stripe product");
    }
  }

  /**
   * Create or retrieve a Stripe price for a subscription plan
   */
  static async createOrGetPrice(
    plan: SubscriptionPlan,
    productId: string
  ): Promise<Stripe.Price> {
    try {
      // Try to find existing price
      const existingPrices = await stripe.prices.list({
        product: productId,
        limit: 100,
      });

      const existingPrice = existingPrices.data.find(
        (price) =>
          price.metadata.subscriptionPlanId === plan.id &&
          price.unit_amount === formatAmountForStripe(Number(plan.basePrice))
      );

      if (existingPrice) {
        return existingPrice;
      }

      // Create new price
      return await stripe.prices.create({
        unit_amount: formatAmountForStripe(Number(plan.basePrice)),
        currency: "ron", // Romanian Leu
        recurring: {
          interval:
            plan.billingInterval === SubscriptionBillingIntervalEnum.Monthly
              ? "month"
              : "year",
        },
        product: productId,
        metadata: {
          subscriptionPlanId: plan.id,
        },
      });
    } catch (error) {
      console.error("Error creating/getting Stripe price:", error);
      throw new Error("Failed to create Stripe price");
    }
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(
    data: CreateCheckoutSessionData
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Get subscription plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: data.subscriptionPlanId },
      });

      if (!plan) {
        throw new Error("Subscription plan not found");
      }

      // Get organization and user for customer data
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId },
        include: {
          users: {
            include: {
              user: true,
            },
            where: {
              userId: data.userId,
            },
          },
        },
      });

      if (!organization || organization.users.length === 0) {
        throw new Error("Organization or user not found");
      }

      const user = organization.users[0].user;

      // Create or get Stripe customer
      const customer = await this.createOrGetCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        organizationId: data.organizationId,
      });

      // Use existing Stripe product and price from synced metadata
      const metadata = plan.metadata as any;
      if (!metadata?.stripeProductId || !metadata?.stripePriceId) {
        throw new Error(
          "Plan is missing Stripe product/price IDs. Please sync subscription plans first."
        );
      }

      const stripeProductId = metadata.stripeProductId;
      const stripePriceId = metadata.stripePriceId;

      // Verify the Stripe product and price still exist
      try {
        await stripe.products.retrieve(stripeProductId);
        await stripe.prices.retrieve(stripePriceId);
      } catch (error) {
        logError(error);
        throw new Error(
          "Stripe product or price no longer exists. Please re-sync subscription plans."
        );
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          organizationId: data.organizationId,
          subscriptionPlanId: data.subscriptionPlanId,
          userId: data.userId,
        },
        subscription_data: {
          metadata: {
            organizationId: data.organizationId,
            subscriptionPlanId: data.subscriptionPlanId,
          },
        },
      });

      return session;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw new Error("Failed to create checkout session");
    }
  }

  /**
   * Handle successful subscription creation from webhook
   */
  static async handleSubscriptionCreated(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    try {
      const organizationId = stripeSubscription.metadata.organizationId;
      const subscriptionPlanId = stripeSubscription.metadata.subscriptionPlanId;

      if (!organizationId || !subscriptionPlanId) {
        throw new Error("Missing metadata in Stripe subscription");
      }

      // Get the subscription plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: subscriptionPlanId },
      });

      if (!plan) {
        throw new Error("Subscription plan not found");
      }

      // Access period dates from Stripe subscription (using type assertion for proper access)
      const subscription = stripeSubscription as any;
      const periodStart = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : new Date();

      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days

      // Create subscription record in our database
      await prisma.subscription.create({
        data: {
          organizationId,
          planId: subscriptionPlanId,
          startDate: periodStart,
          endDate: periodEnd,
          subscriptionDate: new Date(),
          isPaid: true,
          isActive: stripeSubscription.status === "active",
          totalAmount: plan.basePrice,
          paidAt: new Date(),
          notes: `Stripe subscription: ${stripeSubscription.id}`,
        },
      });

      // Update organization's subscription plan
      await prisma.organization.update({
        where: { id: organizationId },
        data: { subscriptionPlanId },
      });

      console.log(`Subscription created for organization ${organizationId}`);
    } catch (error) {
      console.error("Error handling subscription created:", error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation
   */
  static async handleSubscriptionCanceled(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    try {
      const organizationId = stripeSubscription.metadata.organizationId;

      if (!organizationId) {
        throw new Error(
          "Missing organization ID in Stripe subscription metadata"
        );
      }

      // Update active subscription to inactive
      await prisma.subscription.updateMany({
        where: {
          organizationId,
          isActive: true,
        },
        data: {
          isActive: false,
          notes: "Subscription canceled via Stripe",
        },
      });

      console.log(`Subscription canceled for organization ${organizationId}`);
    } catch (error) {
      console.error("Error handling subscription canceled:", error);
      throw error;
    }
  }
}
