import {
  createApartmentSchema,
  apartmentIdSchema,
} from "@/lib/validations/apartment";
import { faker } from "@faker-js/faker";

describe("Apartment Validation", () => {
  describe("createApartmentSchema", () => {
    it("should validate valid apartment data", () => {
      const validData = {
        number: "101",
        floor: 1,
        buildingId: faker.string.uuid(),
        isOccupied: false,
        surface: 85.5,
        description: "Two-bedroom apartment",
      };

      const result = createApartmentSchema.parse(validData);

      expect(result).toEqual(validData);
    });

    it("should handle string floor conversion", () => {
      const validData = {
        number: "101",
        floor: "1", // String that should be converted to number
        buildingId: faker.string.uuid(),
      };

      const result = createApartmentSchema.parse(validData);

      expect(result.floor).toBe(1);
      expect(typeof result.floor).toBe("number");
    });

    it("should handle string surface conversion", () => {
      const validData = {
        number: "101",
        floor: 1,
        buildingId: faker.string.uuid(),
        surface: "85.5", // String that should be converted to number
      };

      const result = createApartmentSchema.parse(validData);

      expect(result.surface).toBe(85.5);
      expect(typeof result.surface).toBe("number");
    });

    it("should set default values", () => {
      const validData = {
        number: "101",
        floor: 1,
        buildingId: faker.string.uuid(),
      };

      const result = createApartmentSchema.parse(validData);

      expect(result.isOccupied).toBe(false);
    });

    it("should handle optional fields as undefined", () => {
      const validData = {
        number: "101",
        floor: 1,
        buildingId: faker.string.uuid(),
        surface: "", // Empty string should become undefined
      };

      const result = createApartmentSchema.parse(validData);

      expect(result.surface).toBeUndefined();
    });

    describe("number validation", () => {
      it("should fail if number is empty", () => {
        const invalidData = {
          number: "",
          floor: 1,
          buildingId: faker.string.uuid(),
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should fail if number is too long", () => {
        const invalidData = {
          number: "12345678901", // 11 characters
          floor: 1,
          buildingId: faker.string.uuid(),
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should fail if number contains special characters", () => {
        const invalidData = {
          number: "101-A",
          floor: 1,
          buildingId: faker.string.uuid(),
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should accept alphanumeric apartment numbers", () => {
        const validData = {
          number: "101A",
          floor: 1,
          buildingId: faker.string.uuid(),
        };

        const result = createApartmentSchema.parse(validData);
        expect(result.number).toBe("101A");
      });
    });

    describe("floor validation", () => {
      it("should fail if floor is negative", () => {
        const invalidData = {
          number: "101",
          floor: -1,
          buildingId: faker.string.uuid(),
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should fail if floor exceeds maximum", () => {
        const invalidData = {
          number: "101",
          floor: 51,
          buildingId: faker.string.uuid(),
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should accept ground floor (0)", () => {
        const validData = {
          number: "101",
          floor: 0,
          buildingId: faker.string.uuid(),
        };

        const result = createApartmentSchema.parse(validData);
        expect(result.floor).toBe(0);
      });

      it("should fail if floor is not a whole number", () => {
        const invalidData = {
          number: "101",
          floor: 1.5,
          buildingId: faker.string.uuid(),
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });
    });

    describe("buildingId validation", () => {
      it("should fail if buildingId is not a valid UUID", () => {
        const invalidData = {
          number: "101",
          floor: 1,
          buildingId: "invalid-uuid",
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should fail if buildingId is missing", () => {
        const invalidData = {
          number: "101",
          floor: 1,
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });
    });

    describe("surface validation", () => {
      it("should fail if surface is negative", () => {
        const invalidData = {
          number: "101",
          floor: 1,
          buildingId: faker.string.uuid(),
          surface: -10,
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should fail if surface is zero", () => {
        const invalidData = {
          number: "101",
          floor: 1,
          buildingId: faker.string.uuid(),
          surface: 0,
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should fail if surface exceeds maximum", () => {
        const invalidData = {
          number: "101",
          floor: 1,
          buildingId: faker.string.uuid(),
          surface: 1001,
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should accept decimal values", () => {
        const validData = {
          number: "101",
          floor: 1,
          buildingId: faker.string.uuid(),
          surface: 85.75,
        };

        const result = createApartmentSchema.parse(validData);
        expect(result.surface).toBe(85.75);
      });
    });

    describe("description validation", () => {
      it("should fail if description exceeds maximum length", () => {
        const invalidData = {
          number: "101",
          floor: 1,
          buildingId: faker.string.uuid(),
          description: "a".repeat(501), // 501 characters
        };

        expect(() => createApartmentSchema.parse(invalidData)).toThrow();
      });

      it("should accept valid description", () => {
        const validData = {
          number: "101",
          floor: 1,
          buildingId: faker.string.uuid(),
          description: "Beautiful two-bedroom apartment with balcony",
        };

        const result = createApartmentSchema.parse(validData);
        expect(result.description).toBe(
          "Beautiful two-bedroom apartment with balcony"
        );
      });

      it("should accept empty description", () => {
        const validData = {
          number: "101",
          floor: 1,
          buildingId: faker.string.uuid(),
          description: "",
        };

        const result = createApartmentSchema.parse(validData);
        expect(result.description).toBe("");
      });
    });
  });

  describe("apartmentIdSchema", () => {
    it("should validate valid UUID", () => {
      const validData = {
        id: faker.string.uuid(),
      };

      const result = apartmentIdSchema.parse(validData);
      expect(result.id).toBe(validData.id);
    });

    it("should fail if id is not a valid UUID", () => {
      const invalidData = {
        id: "invalid-uuid",
      };

      expect(() => apartmentIdSchema.parse(invalidData)).toThrow();
    });

    it("should fail if id is missing", () => {
      const invalidData = {};

      expect(() => apartmentIdSchema.parse(invalidData)).toThrow();
    });
  });
});
