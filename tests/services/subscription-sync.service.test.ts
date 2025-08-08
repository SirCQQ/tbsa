jest.mock("@/lib/stripe", () => ({
  stripe: {
    products: {
      list: jest.fn(),
      retrieve: jest.fn(),
    },
    prices: {
      list: jest.fn(),
    },
  },
  getStripe: jest.fn(),
  formatAmountForStripe: jest.fn(),
  formatAmountFromStripe: jest.fn(),
  webhookSecret: "whsec_test",
}));

jest.mock("@prisma/client", () => {
  class PrismaClient {
    subscriptionPlan = {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
  }
  class Decimal {
    value: number;
    constructor(value: number) {
      this.value = value;
    }
  }
  const SubscriptionBillingIntervalEnum = {
    Monthly: "Monthly",
    Yearly: "Yearly",
  };
  const SubscriptionTypeEnum = {
    Silver: "Silver",
    Bronze: "Bronze",
    Gold: "Gold",
  };
  return {
    PrismaClient,
    Prisma: { Decimal },
    SubscriptionBillingIntervalEnum,
    SubscriptionTypeEnum,
  };
});

import { SubscriptionSyncService } from "@/services/subscription-sync.service";

import {
  Prisma,
  SubscriptionBillingIntervalEnum,
  SubscriptionTypeEnum,
} from "@prisma/client";
import { ErrorServiceResult } from "@/types/api-response";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

describe("SubscriptionSyncService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("syncSubscriptions", () => {
    it("should sync products from Stripe successfully", async () => {
      // Mock Stripe responses
      const mockProduct = {
        id: "prod_test123",
        object: "product" as const,
        name: "Pro Plan",
        description: "Professional subscription plan",
        active: true,
        metadata: {
          tier: "Silver",
          maxBuildings: "50",
          maxApartments: "500",
          maxUsers: "25",
          popular: "true",
          cta: "Most Popular",
        },
        type: "service" as const,
        created: 1234567890,
        updated: 1234567890,
      };

      const mockPrice = {
        id: "price_test123",
        object: "price" as const,
        active: true,
        billing_scheme: "per_unit" as const,
        created: 1234567890,
        currency: "ron",
        product: "prod_test123",
        recurring: {
          interval: "month" as const,
          interval_count: 1,
        },
        unit_amount: 2900, // 29.00 RON
        metadata: {},
        type: "recurring" as const,
      };

      (stripe.products.list as jest.Mock).mockResolvedValue({
        object: "list",
        data: [mockProduct],
        has_more: false,
        url: "/v1/products",
      });

      (stripe.prices.list as jest.Mock).mockResolvedValue({
        object: "list",
        data: [mockPrice],
        has_more: false,
        url: "/v1/prices",
      });

      // Mock database responses
      (prisma.subscriptionPlan.findFirst as jest.Mock).mockResolvedValue(null); // No existing plan
      (prisma.subscriptionPlan.create as jest.Mock).mockResolvedValue({
        id: "plan_123",
        name: "Pro Plan",
        description: "Professional subscription plan",
        basePrice: new Prisma.Decimal(29),
        billingInterval: SubscriptionBillingIntervalEnum.Monthly,
        maxBuildings: 50,
        maxApartments: 500,
        maxUsers: 25,
        popular: true,
        cta: "Most Popular",
        subscriptionType: SubscriptionTypeEnum.Silver,
        metadata: {
          stripeProductId: "prod_test123",
          stripePriceId: "price_test123",
          stripeMetadata: mockProduct.metadata,
          syncedAt: expect.any(String),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      // Execute sync
      const result = await SubscriptionSyncService.syncSubscriptions();

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalProducts: 1,
        syncedPlans: 1,
        skippedProducts: 0,
        errors: [],
        timestamp: expect.any(Date),
        createdPlans: ["Pro Plan"],
        updatedPlans: [],
      });

      expect(stripe.products.list as jest.Mock).toHaveBeenCalledWith({
        active: true,
        type: "service",
        limit: 100,
        starting_after: undefined,
      });

      expect(stripe.prices.list as jest.Mock).toHaveBeenCalledWith({
        product: "prod_test123",
        active: true,
        type: "recurring",
        limit: 100,
      });

      expect(prisma.subscriptionPlan.create as jest.Mock).toHaveBeenCalledWith({
        data: {
          name: "Pro Plan",
          description: "Professional subscription plan",
          basePrice: expect.any(Prisma.Decimal),
          billingInterval: SubscriptionBillingIntervalEnum.Monthly,
          maxBuildings: 50,
          maxApartments: 500,
          maxUsers: 25,
          popular: true,
          cta: "Most Popular",
          subscriptionType: SubscriptionTypeEnum.Silver,
          metadata: {
            stripeProductId: "prod_test123",
            stripePriceId: "price_test123",
            stripeMetadata: mockProduct.metadata,
            syncedAt: expect.any(String),
          },
        },
      });
    });

    it("should update existing subscription plan", async () => {
      const mockProduct = {
        id: "prod_test123",
        object: "product" as const,
        name: "Updated Pro Plan",
        description: "Updated description",
        active: true,
        metadata: { tier: "Gold" },
        type: "service" as const,
        created: 1234567890,
        updated: 1234567890,
      };

      const mockPrice = {
        id: "price_test123",
        object: "price" as const,
        active: true,
        billing_scheme: "per_unit" as const,
        created: 1234567890,
        currency: "ron",
        product: "prod_test123",
        recurring: { interval: "year" as const, interval_count: 1 },
        unit_amount: 29000, // 290.00 RON
        metadata: {},
        type: "recurring" as const,
      };

      const existingPlan = {
        id: "plan_existing",
        name: "Old Pro Plan",
        description: "Old description",
        basePrice: new Prisma.Decimal(29),
        billingInterval: SubscriptionBillingIntervalEnum.Monthly,
        maxBuildings: null,
        maxApartments: null,
        maxUsers: null,
        popular: false,
        cta: null,
        subscriptionType: SubscriptionTypeEnum.Bronze,
        metadata: { stripeProductId: "prod_test123" },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (stripe.products.list as jest.Mock).mockResolvedValue({
        object: "list",
        data: [mockProduct],
        has_more: false,
        url: "/v1/products",
      });

      (stripe.prices.list as jest.Mock).mockResolvedValue({
        object: "list",
        data: [mockPrice],
        has_more: false,
        url: "/v1/prices",
      });

      (prisma.subscriptionPlan.findFirst as jest.Mock).mockResolvedValue(
        existingPlan
      );
      (prisma.subscriptionPlan.update as jest.Mock).mockResolvedValue({
        ...existingPlan,
        name: "Updated Pro Plan",
        description: "Updated description",
        billingInterval: SubscriptionBillingIntervalEnum.Yearly,
        basePrice: new Prisma.Decimal(290),
      });

      const result = await SubscriptionSyncService.syncSubscriptions();

      expect(result.success).toBe(true);
      expect(result.data?.updatedPlans).toContain("Updated Pro Plan");
      expect(prisma.subscriptionPlan.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: "plan_existing" },
        data: expect.objectContaining({
          name: "Updated Pro Plan",
          description: "Updated description",
          billingInterval: SubscriptionBillingIntervalEnum.Yearly,
        }),
      });
    });

    it("should handle Stripe API errors gracefully", async () => {
      (stripe.products.list as jest.Mock).mockRejectedValue(
        new Error("Stripe API error")
      );

      const result = await SubscriptionSyncService.syncSubscriptions();

      expect(result.success).toBe(false);
      expect((result as ErrorServiceResult).error).toContain(
        "Subscription sync failed"
      );
    });

    it("should skip products without prices", async () => {
      const mockProduct = {
        id: "prod_no_prices",
        object: "product" as const,
        name: "Product Without Prices",
        description: null,
        active: true,
        metadata: {},
        type: "service" as const,
        created: 1234567890,
        updated: 1234567890,
      };

      (stripe.products.list as jest.Mock).mockResolvedValue({
        object: "list",
        data: [mockProduct],
        has_more: false,
        url: "/v1/products",
      });

      (stripe.prices.list as jest.Mock).mockResolvedValue({
        object: "list",
        data: [], // No prices
        has_more: false,
        url: "/v1/prices",
      });

      const result = await SubscriptionSyncService.syncSubscriptions();

      expect(result.success).toBe(true);
      expect(result.data?.skippedProducts).toBe(0);
      expect(result.data?.syncedPlans).toBe(0);
    });
  });

  describe("syncSingleProductById", () => {
    it("should sync a single product by ID", async () => {
      const mockProduct = {
        id: "prod_single",
        object: "product" as const,
        name: "Single Product",
        description: "A single product",
        active: true,
        metadata: { tier: "Bronze" },
        type: "service" as const,
        created: 1234567890,
        updated: 1234567890,
      };

      const mockPrice = {
        id: "price_single",
        object: "price" as const,
        active: true,
        billing_scheme: "per_unit" as const,
        created: 1234567890,
        currency: "ron",
        product: "prod_single",
        recurring: { interval: "month" as const, interval_count: 1 },
        unit_amount: 1500,
        metadata: {},
        type: "recurring" as const,
      };

      (stripe.products.retrieve as jest.Mock).mockResolvedValue(mockProduct);
      (stripe.prices.list as jest.Mock).mockResolvedValue({
        object: "list",
        data: [mockPrice],
        has_more: false,
        url: "/v1/prices",
      });

      (prisma.subscriptionPlan.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.subscriptionPlan.create as jest.Mock).mockResolvedValue({
        id: "plan_single",
        name: "Single Product",
        description: "A single product",
        basePrice: new Prisma.Decimal(15),
        billingInterval: SubscriptionBillingIntervalEnum.Monthly,
        maxBuildings: null,
        maxApartments: null,
        maxUsers: null,
        popular: false,
        cta: null,
        subscriptionType: SubscriptionTypeEnum.Bronze,
        metadata: { stripeProductId: "prod_single" },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result =
        await SubscriptionSyncService.syncSingleProductById("prod_single");

      expect(result.success).toBe(true);
      expect(result.data?.planName).toBe("Single Product");
      expect(result.data?.action).toBe("created");
    });

    it("should fail when product is not active", async () => {
      const inactiveProduct = {
        id: "prod_inactive",
        object: "product" as const,
        name: "Inactive Product",
        description: null,
        active: false,
        metadata: {},
        type: "service" as const,
        created: 1234567890,
        updated: 1234567890,
      };

      (stripe.products.retrieve as jest.Mock).mockResolvedValue(
        inactiveProduct
      );

      const result =
        await SubscriptionSyncService.syncSingleProductById("prod_inactive");

      expect(result.success).toBe(false);
      expect((result as ErrorServiceResult).error).toBe(
        "Product is not active in Stripe"
      );
    });
  });

  describe("getSyncStatus", () => {
    it("should return sync status", async () => {
      const result = await SubscriptionSyncService.getSyncStatus();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        lastSyncTime: null,
        isRunning: false,
        totalErrors: 0,
        lastErrors: [],
      });
    });
  });
});
