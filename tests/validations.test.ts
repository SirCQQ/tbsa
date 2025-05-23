import {
  userSchema,
  loginSchema,
  registerSchema,
  buildingSchema,
  apartmentSchema,
  waterReadingSchema,
} from "../src/lib/validations";

describe("Validation Schemas", () => {
  describe("userSchema", () => {
    it("should validate valid user data", () => {
      const validUser = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+40123456789",
        role: "ADMINISTRATOR" as const,
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidUser = {
        email: "invalid-email",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "ADMINISTRATOR" as const,
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("should reject short password", () => {
      const invalidUser = {
        email: "test@example.com",
        password: "123",
        firstName: "John",
        lastName: "Doe",
        role: "ADMINISTRATOR" as const,
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must be at least 6 characters"
        );
      }
    });

    it("should reject empty password", () => {
      const invalidUser = {
        email: "test@example.com",
        password: "",
        firstName: "John",
        lastName: "Doe",
        role: "ADMINISTRATOR" as const,
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is required");
      }
    });

    it("should reject whitespace-only password", () => {
      const invalidUser = {
        email: "test@example.com",
        password: "   ",
        firstName: "John",
        lastName: "Doe",
        role: "ADMINISTRATOR" as const,
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.message === "Password cannot be empty or only whitespace"
          )
        ).toBe(true);
      }
    });

    it("should accept optional phone", () => {
      const validUser = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "OWNER" as const,
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });
  });

  describe("loginSchema", () => {
    it("should validate valid login data", () => {
      const validLogin = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const invalidLogin = {
        email: "test@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate when passwords match", () => {
      const validRegister = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "OWNER" as const,
      };

      const result = registerSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const invalidRegister = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
        firstName: "John",
        lastName: "Doe",
        role: "OWNER" as const,
      };

      const result = registerSchema.safeParse(invalidRegister);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });
  });

  describe("buildingSchema", () => {
    it("should validate valid building data", () => {
      const validBuilding = {
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
        postalCode: "12345",
        readingDeadline: 25,
      };

      const result = buildingSchema.safeParse(validBuilding);
      expect(result.success).toBe(true);
    });

    it("should reject invalid reading deadline", () => {
      const invalidBuilding = {
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
        readingDeadline: 35, // Invalid: > 31
      };

      const result = buildingSchema.safeParse(invalidBuilding);
      expect(result.success).toBe(false);
    });

    it("should accept optional postal code", () => {
      const validBuilding = {
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
        readingDeadline: 25,
      };

      const result = buildingSchema.safeParse(validBuilding);
      expect(result.success).toBe(true);
    });
  });

  describe("apartmentSchema", () => {
    it("should validate valid apartment data", () => {
      const validApartment = {
        number: "12A",
        floor: 3,
        rooms: 2,
        buildingId: "123e4567-e89b-12d3-a456-426614174000",
        ownerId: "123e4567-e89b-12d3-a456-426614174001",
      };

      const result = apartmentSchema.safeParse(validApartment);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const invalidApartment = {
        number: "12A",
        buildingId: "invalid-uuid",
      };

      const result = apartmentSchema.safeParse(invalidApartment);
      expect(result.success).toBe(false);
    });

    it("should accept optional fields", () => {
      const validApartment = {
        number: "12A",
        buildingId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = apartmentSchema.safeParse(validApartment);
      expect(result.success).toBe(true);
    });
  });

  describe("waterReadingSchema", () => {
    it("should validate valid water reading data", () => {
      const validReading = {
        apartmentId: "123e4567-e89b-12d3-a456-426614174000",
        day: 15,
        month: 6,
        year: 2024,
        reading: 1250.5,
      };

      const result = waterReadingSchema.safeParse(validReading);
      expect(result.success).toBe(true);
    });

    it("should reject invalid month", () => {
      const invalidReading = {
        apartmentId: "123e4567-e89b-12d3-a456-426614174000",
        day: 15,
        month: 13, // Invalid: > 12
        year: 2024,
        reading: 1250.5,
      };

      const result = waterReadingSchema.safeParse(invalidReading);
      expect(result.success).toBe(false);
    });

    it("should reject negative reading", () => {
      const invalidReading = {
        apartmentId: "123e4567-e89b-12d3-a456-426614174000",
        day: 15,
        month: 6,
        year: 2024,
        reading: -10,
      };

      const result = waterReadingSchema.safeParse(invalidReading);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Reading must be positive");
      }
    });

    it("should reject invalid day", () => {
      const invalidReading = {
        apartmentId: "123e4567-e89b-12d3-a456-426614174000",
        day: 32, // Invalid: > 31
        month: 6,
        year: 2024,
        reading: 1250.5,
      };

      const result = waterReadingSchema.safeParse(invalidReading);
      expect(result.success).toBe(false);
    });
  });
});
