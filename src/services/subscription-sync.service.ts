import { prisma } from "@/lib/prisma";
import { ServiceResult } from "@/types/api-response";
import { stripe, formatAmountFromStripe } from "@/lib/stripe";
import {
  SubscriptionBillingIntervalEnum,
  SubscriptionTypeEnum,
  Prisma,
} from "@prisma/client";
import Stripe from "stripe";

export type SyncResult = {
  totalProducts: number;
  syncedPlans: number;
  skippedProducts: number;
  errors: string[];
  timestamp: Date;
  createdPlans: string[];
  updatedPlans: string[];
};

export type SyncStatus = {
  lastSyncTime: Date | null;
  isRunning: boolean;
  totalErrors: number;
  lastErrors: string[];
};

type StripeProductWithPrices = {
  product: Stripe.Product;
  prices: Stripe.Price[];
};

export class SubscriptionSyncService {
  private static isRunning = false;

  /**
   * Sync subscription plans from Stripe products
   */
  static async syncSubscriptions(): Promise<ServiceResult<SyncResult>> {
    if (this.isRunning) {
      return {
        success: false,
        error: "Sync is already running",
      };
    }

    this.isRunning = true;

    try {
      await this.logSyncOperation(
        "sync_started",
        "success",
        "Starting subscription sync from Stripe"
      );

      // Fetch all active subscription products from Stripe
      const stripeProducts = await this.fetchStripeProducts();

      const result: SyncResult = {
        totalProducts: stripeProducts.length,
        syncedPlans: 0,
        skippedProducts: 0,
        errors: [],
        timestamp: new Date(),
        createdPlans: [],
        updatedPlans: [],
      };

      // Process each product
      for (const productWithPrices of stripeProducts) {
        try {
          const syncResult = await this.syncSingleProduct(productWithPrices);

          if (syncResult.action === "created") {
            result.createdPlans.push(syncResult.planName);
            result.syncedPlans++;
          } else if (syncResult.action === "updated") {
            result.updatedPlans.push(syncResult.planName);
            result.syncedPlans++;
          } else {
            result.skippedProducts++;
          }
        } catch (error) {
          const errorMessage = `Failed to sync product ${productWithPrices.product.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          result.errors.push(errorMessage);
          await this.logSyncOperation(
            "product_sync_error",
            "error",
            errorMessage
          );
        }
      }

      await this.logSyncOperation(
        "sync_completed",
        "success",
        `Synced ${result.syncedPlans} plans, skipped ${result.skippedProducts}, errors: ${result.errors.length}`
      );

      return {
        success: true,
        data: result,
        message: `Sync completed: ${result.syncedPlans} plans synced, ${result.errors.length} errors`,
      };
    } catch (error) {
      const errorMessage = `Subscription sync failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      await this.logSyncOperation("sync_failed", "error", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Fetch all subscription products from Stripe with their prices
   */
  private static async fetchStripeProducts(): Promise<
    StripeProductWithPrices[]
  > {
    const products: StripeProductWithPrices[] = [];

    // Fetch all active products
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const productList = await stripe.products.list({
        active: true,
        type: "service", // Only subscription products
        limit: 100,
        starting_after: startingAfter,
      });

      for (const product of productList.data) {
        // Fetch prices for this product
        const priceList = await stripe.prices.list({
          product: product.id,
          active: true,
          type: "recurring", // Only subscription prices
          limit: 100,
        });

        if (priceList.data.length > 0) {
          products.push({
            product,
            prices: priceList.data,
          });
        }
      }

      hasMore = productList.has_more;
      if (hasMore && productList.data.length > 0) {
        startingAfter = productList.data[productList.data.length - 1].id;
      }
    }

    return products;
  }

  /**
   * Sync a single Stripe product to database
   */
  private static async syncSingleProduct(
    productWithPrices: StripeProductWithPrices
  ): Promise<{ action: "created" | "updated" | "skipped"; planName: string }> {
    const { product, prices } = productWithPrices;

    // Skip products without prices
    if (prices.length === 0) {
      return { action: "skipped", planName: product.name };
    }

    // For simplicity, we'll use the first price as the primary price
    // In a more complex scenario, you might want to handle multiple prices per product
    const primaryPrice = prices[0];

    // Extract metadata and map to our schema
    const mappedPlan = this.mapStripeProductToPlan(product, primaryPrice);

    // Check if plan already exists (by Stripe product ID in metadata)
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        metadata: {
          path: ["stripeProductId"],
          equals: product.id,
        },
      },
    });

    if (existingPlan) {
      // Update existing plan
      await prisma.subscriptionPlan.update({
        where: { id: existingPlan.id },
        data: mappedPlan,
      });

      return { action: "updated", planName: product.name };
    } else {
      // Create new plan
      await prisma.subscriptionPlan.create({
        data: mappedPlan,
      });

      return { action: "created", planName: product.name };
    }
  }

  /**
   * Map Stripe product and price to our SubscriptionPlan schema
   */
  private static mapStripeProductToPlan(
    product: Stripe.Product,
    price: Stripe.Price
  ): Prisma.SubscriptionPlanCreateInput {
    // Convert Stripe amount (cents) to our decimal format
    const basePrice = new Prisma.Decimal(
      formatAmountFromStripe(price.unit_amount || 0)
    );

    // Map billing interval
    const billingInterval =
      price.recurring?.interval === "year"
        ? SubscriptionBillingIntervalEnum.Yearly
        : SubscriptionBillingIntervalEnum.Monthly;

    // Extract limits from metadata with defaults
    const metadata = product.metadata || {};
    const maxBuildings = metadata.maxBuildings
      ? parseInt(metadata.maxBuildings)
      : null;
    const maxApartments = metadata.maxApartments
      ? parseInt(metadata.maxApartments)
      : null;
    const maxUsers = metadata.maxUsers ? parseInt(metadata.maxUsers) : null;

    // Map subscription type from metadata
    const subscriptionType = this.mapSubscriptionType(metadata.tier);

    // Extract UI metadata
    const popular = metadata.popular === "true";
    const cta = metadata.cta || null;

    return {
      name: product.name,
      description: product.description || null,
      basePrice,
      billingInterval,
      maxBuildings,
      maxApartments,
      maxUsers,
      popular,
      cta,
      subscriptionType,
      metadata: {
        stripeProductId: product.id,
        stripePriceId: price.id,
        stripeMetadata: metadata,
        syncedAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
    };
  }

  /**
   * Map Stripe metadata tier to our SubscriptionTypeEnum
   */
  private static mapSubscriptionType(tier?: string): SubscriptionTypeEnum {
    if (!tier) return SubscriptionTypeEnum.Bronze;

    const tierMap: Record<string, SubscriptionTypeEnum> = {
      bronze: SubscriptionTypeEnum.Bronze,
      silver: SubscriptionTypeEnum.Silver,
      gold: SubscriptionTypeEnum.Gold,
      platinum: SubscriptionTypeEnum.Platinum,
      diamond: SubscriptionTypeEnum.Diamond,
      enterprise: SubscriptionTypeEnum.Enterprise,
      custom: SubscriptionTypeEnum.Custom,
    };

    return tierMap[tier.toLowerCase()] || SubscriptionTypeEnum.Bronze;
  }

  /**
   * Get the current sync status
   */
  static async getSyncStatus(): Promise<ServiceResult<SyncStatus>> {
    try {
      // TODO: Implement actual status tracking with database table
      // For now, return basic status
      const status: SyncStatus = {
        lastSyncTime: null, // TODO: Get from sync log table
        isRunning: this.isRunning,
        totalErrors: 0, // TODO: Count from sync log table
        lastErrors: [], // TODO: Get recent errors from sync log table
      };

      return {
        success: true,
        data: status,
        message: "Sync status retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting sync status:", error);
      return {
        success: false,
        error: "Failed to get sync status",
      };
    }
  }

  /**
   * Force sync a specific Stripe product by ID
   */
  static async syncSingleProductById(
    productId: string
  ): Promise<ServiceResult<{ planName: string; action: string }>> {
    try {
      // Fetch specific product
      const product = await stripe.products.retrieve(productId);

      if (!product.active) {
        return {
          success: false,
          error: "Product is not active in Stripe",
        };
      }

      // Fetch prices for this product
      const priceList = await stripe.prices.list({
        product: productId,
        active: true,
        type: "recurring",
      });

      if (priceList.data.length === 0) {
        return {
          success: false,
          error: "No active recurring prices found for this product",
        };
      }

      const result = await this.syncSingleProduct({
        product,
        prices: priceList.data,
      });

      return {
        success: true,
        data: result,
        message: `Product ${result.planName} ${result.action} successfully`,
      };
    } catch (error) {
      console.error("Error syncing single product:", error);
      return {
        success: false,
        error: `Failed to sync product: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Private helper method to log sync operations
   */
  private static async logSyncOperation(
    operation: string,
    result: "success" | "error",
    details?: string
  ): Promise<void> {
    // TODO: Implement logging to audit table or dedicated sync log table
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] Sync operation: ${operation}, Result: ${result}`,
      details
    );
  }
}
