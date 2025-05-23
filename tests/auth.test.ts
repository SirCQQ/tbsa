import { hashPassword, verifyPassword } from "@/lib/auth";

describe("Auth Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "testpassword123";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it("should generate different hashes for the same password", async () => {
      const password = "samepassword";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Should be different due to salt
    });

    it("should throw error for empty password", async () => {
      const password = "";

      await expect(hashPassword(password)).rejects.toThrow(
        "Password cannot be empty"
      );
    });

    it("should throw error for whitespace-only password", async () => {
      const password = "   ";

      await expect(hashPassword(password)).rejects.toThrow(
        "Password cannot be empty"
      );
    });

    it("should throw error for null/undefined password", async () => {
      await expect(hashPassword(null as any)).rejects.toThrow(
        "Password cannot be empty"
      );
      await expect(hashPassword(undefined as any)).rejects.toThrow(
        "Password cannot be empty"
      );
    });

    it("should accept password with leading/trailing spaces if it has content", async () => {
      const password = "  validpassword  ";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "correctpassword";
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const correctPassword = "correctpassword";
      const incorrectPassword = "wrongpassword";
      const hashedPassword = await hashPassword(correctPassword);

      const isValid = await verifyPassword(incorrectPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it("should throw error for empty password", async () => {
      const hashedPassword = await hashPassword("validpassword");

      await expect(verifyPassword("", hashedPassword)).rejects.toThrow(
        "Password cannot be empty"
      );
    });

    it("should throw error for whitespace-only password", async () => {
      const hashedPassword = await hashPassword("validpassword");

      await expect(verifyPassword("   ", hashedPassword)).rejects.toThrow(
        "Password cannot be empty"
      );
    });

    it("should throw error for empty hashed password", async () => {
      const password = "validpassword";

      await expect(verifyPassword(password, "")).rejects.toThrow(
        "Hashed password cannot be empty"
      );
      await expect(verifyPassword(password, null as any)).rejects.toThrow(
        "Hashed password cannot be empty"
      );
      await expect(verifyPassword(password, undefined as any)).rejects.toThrow(
        "Hashed password cannot be empty"
      );
    });

    it("should handle invalid hash format", async () => {
      const password = "testpassword";
      const invalidHash = "invalidhash";

      const result = await verifyPassword(password, invalidHash);
      expect(result).toBe(false);
    });

    it("should throw error for null/undefined password", async () => {
      const hashedPassword = await hashPassword("validpassword");

      await expect(verifyPassword(null as any, hashedPassword)).rejects.toThrow(
        "Password cannot be empty"
      );
      await expect(
        verifyPassword(undefined as any, hashedPassword)
      ).rejects.toThrow("Password cannot be empty");
    });

    it("should accept password with leading/trailing spaces if it has content", async () => {
      const password = "  validpassword  ";
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });
});
