describe("Prisma Client Singleton", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
    // Clear global prisma instance
    (globalThis as any).prisma = undefined;
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
      });
    }
  });

  it("should create a prisma instance in development environment", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
    });

    const { prisma } = await import("@/lib/prisma");

    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe("object");
  });

  it("should set global prisma instance in non-production environment", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
    });

    // Clear global first
    (globalThis as any).prisma = undefined;

    const { prisma } = await import("@/lib/prisma");

    expect(prisma).toBeDefined();
    // In non-production, global should be set
    expect((globalThis as any).prisma).toBe(prisma);
  });

  it("should create prisma instance in production environment", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      writable: true,
    });

    const { prisma } = await import("@/lib/prisma");

    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe("object");
  });

  it("should reuse existing global prisma instance when available", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
    });

    // Create a mock prisma instance
    const mockPrisma = { test: "mock" };
    (globalThis as any).prisma = mockPrisma;

    const { prisma } = await import("@/lib/prisma");

    expect(prisma).toBe(mockPrisma);
  });

  it("should handle test environment properly", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "test",
      writable: true,
    });

    const { prisma } = await import("@/lib/prisma");

    expect(prisma).toBeDefined();
    // In test (non-production), global should be set
    expect((globalThis as any).prisma).toBe(prisma);
  });
});
