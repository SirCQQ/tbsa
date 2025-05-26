import { UserSchema, LoginSchema, RegisterSchema } from "../src/schemas/user";
import {
  CreateBuildingSchema,
  UpdateBuildingSchema,
} from "../src/schemas/building";
import { ApartmentSchema } from "../src/schemas/apartment";

describe("Validation Schemas", () => {
  describe("UserSchema", () => {
    it("should validate a valid user", () => {
      const validUser = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        role: "ADMINISTRATOR" as const,
      };

      const result = UserSchema.safeParse(validUser);
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

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
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

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("password");
      }
    });

    it("should reject empty password", () => {
      const invalidUser = {
        email: "test@example.com",
        password: "   ",
        firstName: "John",
        lastName: "Doe",
        role: "ADMINISTRATOR" as const,
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("password");
      }
    });

    it("should accept valid user with optional phone", () => {
      const validUser = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "OWNER" as const,
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });
  });

  describe("LoginSchema", () => {
    it("should validate valid login data", () => {
      const validLogin = {
        email: "test@example.com",
        password: "password123",
      };

      const result = LoginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it("should reject invalid login data", () => {
      const invalidLogin = {
        email: "invalid-email",
        password: "",
      };

      const result = LoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });

  describe("RegisterSchema", () => {
    it("should validate valid registration data", () => {
      const validRegister = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        role: "ADMINISTRATOR" as const,
      };

      const result = RegisterSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const invalidRegister = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "different",
        firstName: "John",
        lastName: "Doe",
        role: "ADMINISTRATOR" as const,
      };

      const result = RegisterSchema.safeParse(invalidRegister);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateBuildingSchema", () => {
    it("should validate a valid building", () => {
      const validBuilding = {
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
        postalCode: "123456",
        readingDeadline: 25,
      };

      const result = CreateBuildingSchema.safeParse(validBuilding);
      expect(result.success).toBe(true);
    });

    it("should reject invalid building data", () => {
      const invalidBuilding = {
        name: "",
        address: "123 Test Street",
        city: "Test City",
        readingDeadline: 35, // Invalid deadline
      };

      const result = CreateBuildingSchema.safeParse(invalidBuilding);
      expect(result.success).toBe(false);
    });

    it("should use default reading deadline", () => {
      const validBuilding = {
        name: "Test Building",
        address: "123 Test Street",
        city: "Test City",
      };

      const result = CreateBuildingSchema.safeParse(validBuilding);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.readingDeadline).toBe(25);
      }
    });
  });

  describe("ApartmentSchema", () => {
    it("should validate a valid apartment", () => {
      const validApartment = {
        number: "101",
        floor: 1,
        rooms: 3,
        buildingId: "550e8400-e29b-41d4-a716-446655440000",
        ownerId: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = ApartmentSchema.safeParse(validApartment);
      expect(result.success).toBe(true);
    });

    it("should reject invalid apartment data", () => {
      const invalidApartment = {
        number: "",
        floor: 1,
        rooms: 3,
        buildingId: "invalid-uuid",
      };

      const result = ApartmentSchema.safeParse(invalidApartment);
      expect(result.success).toBe(false);
    });

    it("should accept apartment without owner", () => {
      const validApartment = {
        number: "101",
        floor: 1,
        rooms: 3,
        buildingId: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = ApartmentSchema.safeParse(validApartment);
      expect(result.success).toBe(true);
    });
  });
});
