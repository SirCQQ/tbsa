import { OrganizationService } from "@/services/organization.service";
import { prisma } from "@/lib/prisma";
import type { OrganizationCreationData } from "@/lib/validations/auth";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    building: {
      count: jest.fn(),
    },
    apartment: {
      count: jest.fn(),
    },
    userOrganization: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    userRole: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organizationRole: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("OrganizationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrganization", () => {
    const mockOrganizationData: OrganizationCreationData = {
      name: "Test Organization",
      code: "test-org",
      description: "Test description",
      subscriptionPlanId: "plan-123",
    };

    it("should create organization successfully", async () => {
      const mockOrganization = {
        id: "org-123",
        ...mockOrganizationData,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.organization.findUnique.mockResolvedValue(null);
      mockPrisma.organization.create.mockResolvedValue(mockOrganization);

      const result =
        await OrganizationService.createOrganization(mockOrganizationData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrganization);
      expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
        where: { code: mockOrganizationData.code },
      });
      expect(mockPrisma.organization.create).toHaveBeenCalledWith({
        data: mockOrganizationData,
      });
    });

    it("should fail if organization code already exists", async () => {
      const existingOrganization = {
        id: "existing-org",
        name: "Existing Org",
        code: mockOrganizationData.code,
      };

      mockPrisma.organization.findUnique.mockResolvedValue(
        existingOrganization as any
      );

      const result =
        await OrganizationService.createOrganization(mockOrganizationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("O organizație cu acest cod există deja");
      expect(mockPrisma.organization.create).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      mockPrisma.organization.create.mockRejectedValue(
        new Error("Database error")
      );

      const result =
        await OrganizationService.createOrganization(mockOrganizationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Eroare la crearea organizației");
    });
  });

  describe("getOrganizationById", () => {
    it("should return organization with subscription plan", async () => {
      const mockOrganization = {
        id: "org-123",
        name: "Test Organization",
        code: "test-org",
        subscriptionPlan: {
          id: "plan-123",
          name: "Pro Plan",
          price: 99.99,
        },
      };

      mockPrisma.organization.findUnique.mockResolvedValue(
        mockOrganization as any
      );

      const result = await OrganizationService.getOrganizationById("org-123");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrganization);
      expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
        where: { id: "org-123" },
        include: { subscriptionPlan: true },
      });
    });

    it("should return error if organization not found", async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const result =
        await OrganizationService.getOrganizationById("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Organizația nu a fost găsită");
    });
  });

  describe("assignUserToOrganization", () => {
    it("should assign user to organization with role", async () => {
      const userId = "user-123";
      const organizationId = "org-123";
      const roleCode = "ADMINISTRATOR";

      const mockRole = {
        id: "role-123",
        code: roleCode,
        name: "Administrator",
        description: "Admin role",
        isSystem: true,
      };

      const mockUserOrganization = {
        id: "user-org-123",
        userId,
        organizationId,
      };

      const mockUserRole = {
        id: "user-role-123",
        userId,
        roleId: mockRole.id,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          userOrganization: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockUserOrganization),
          },
          role: {
            findUnique: jest.fn().mockResolvedValue(mockRole),
          },
          userRole: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockUserRole),
          },
          organizationRole: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
          },
        };

        return callback(txMock as any);
      });

      const result = await OrganizationService.assignUserToOrganization(
        userId,
        organizationId,
        roleCode
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        userOrganization: mockUserOrganization,
        userRole: mockUserRole,
      });
    });

    it("should fail if user is already assigned to organization", async () => {
      const userId = "user-123";
      const organizationId = "org-123";

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          userOrganization: {
            findUnique: jest.fn().mockResolvedValue({ id: "existing" }),
          },
        };

        return callback(txMock as any);
      });

      const result = await OrganizationService.assignUserToOrganization(
        userId,
        organizationId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Utilizatorul este deja asignat acestei organizații"
      );
    });
  });

  describe("generatePaymentLink", () => {
    it("should generate payment link for valid organization and subscription", async () => {
      const paymentData = {
        organizationId: "org-123",
        subscriptionPlanId: "plan-123",
        userId: "user-123",
      };

      const mockSubscriptionPlan = {
        id: "plan-123",
        name: "Pro Plan",
        price: 99.99,
      };

      const mockOrganization = {
        id: "org-123",
        name: "Test Organization",
        code: "test-org",
      };

      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(
        mockSubscriptionPlan as any
      );
      mockPrisma.organization.findUnique.mockResolvedValue(
        mockOrganization as any
      );

      const result = await OrganizationService.generatePaymentLink(paymentData);

      expect(result.success).toBe(true);
      expect(result.data).toContain("/payment/checkout?session_id=");
      expect(result.data).toContain(`org_id=${paymentData.organizationId}`);
      expect(result.data).toContain(
        `plan_id=${paymentData.subscriptionPlanId}`
      );
    });

    it("should fail if subscription plan not found", async () => {
      const paymentData = {
        organizationId: "org-123",
        subscriptionPlanId: "invalid-plan",
        userId: "user-123",
      };

      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(null);

      const result = await OrganizationService.generatePaymentLink(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Planul de abonament nu a fost găsit");
    });

    it("should fail if organization not found", async () => {
      const paymentData = {
        organizationId: "invalid-org",
        subscriptionPlanId: "plan-123",
        userId: "user-123",
      };

      const mockSubscriptionPlan = {
        id: "plan-123",
        name: "Pro Plan",
        price: 99.99,
      };

      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(
        mockSubscriptionPlan as any
      );
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const result = await OrganizationService.generatePaymentLink(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Organizația nu a fost găsită");
    });
  });

  describe("isCodeAvailable", () => {
    it("should return true if code is available", async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const result = await OrganizationService.isCodeAvailable("new-code");

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it("should return false if code is taken", async () => {
      const existingOrg = { id: "org-123", code: "taken-code" };
      mockPrisma.organization.findUnique.mockResolvedValue(existingOrg as any);

      const result = await OrganizationService.isCodeAvailable("taken-code");

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });

  describe("getOrganizationStats", () => {
    it("should return organization statistics", async () => {
      const organizationId = "org-123";

      mockPrisma.building.count.mockResolvedValue(5);
      mockPrisma.apartment.count.mockResolvedValue(25);
      mockPrisma.userOrganization.count.mockResolvedValue(10);

      const result =
        await OrganizationService.getOrganizationStats(organizationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        buildingsCount: 5,
        apartmentsCount: 25,
        usersCount: 10,
      });
    });

    it("should handle database errors", async () => {
      mockPrisma.building.count.mockRejectedValue(new Error("Database error"));

      const result = await OrganizationService.getOrganizationStats("org-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Eroare la încărcarea statisticilor");
    });
  });

  describe("updateOrganization", () => {
    it("should update organization successfully", async () => {
      const organizationId = "org-123";
      const updateData = { name: "Updated Organization" };
      const updatedOrg = { id: organizationId, ...updateData };

      mockPrisma.organization.update.mockResolvedValue(updatedOrg as any);

      const result = await OrganizationService.updateOrganization(
        organizationId,
        updateData
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedOrg);
    });

    it("should check code uniqueness when updating code", async () => {
      const organizationId = "org-123";
      const updateData = { code: "new-code" };

      mockPrisma.organization.findFirst.mockResolvedValue(null);
      mockPrisma.organization.update.mockResolvedValue({
        id: organizationId,
        ...updateData,
      } as any);

      const result = await OrganizationService.updateOrganization(
        organizationId,
        updateData
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.organization.findFirst).toHaveBeenCalledWith({
        where: {
          code: updateData.code,
          NOT: { id: organizationId },
        },
      });
    });

    it("should fail if new code already exists", async () => {
      const organizationId = "org-123";
      const updateData = { code: "existing-code" };
      const existingOrg = { id: "other-org", code: "existing-code" };

      mockPrisma.organization.findFirst.mockResolvedValue(existingOrg as any);

      const result = await OrganizationService.updateOrganization(
        organizationId,
        updateData
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("O organizație cu acest cod există deja");
      expect(mockPrisma.organization.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteOrganization", () => {
    it("should soft delete organization", async () => {
      const organizationId = "org-123";
      const deletedOrg = { id: organizationId, deletedAt: new Date() };

      mockPrisma.organization.update.mockResolvedValue(deletedOrg as any);

      const result =
        await OrganizationService.deleteOrganization(organizationId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(deletedOrg);
      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
