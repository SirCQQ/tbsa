import {
  contactFormSchema,
  formatPhoneNumber,
  type ContactFormData,
} from "@/lib/validations/contact";
import { z } from "zod";

describe("Contact Form Validation", () => {
  describe("contactFormSchema", () => {
    const validData: ContactFormData = {
      firstName: "Ion",
      lastName: "Popescu",
      email: "ion.popescu@email.com",
      phone: "+40123456789",
      subject: "Întrebare despre platformă",
      message:
        "Aș dori să aflu mai multe informații despre TBSA și cum poate ajuta asociația noastră.",
    };

    it("should validate correct data", () => {
      const result = contactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require firstName with minimum 2 characters", () => {
      const invalidData = { ...validData, firstName: "A" };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "cel puțin 2 caractere"
        );
      }
    });

    it("should validate Romanian characters in names", () => {
      const validRomanianData = {
        ...validData,
        firstName: "Ștefan",
        lastName: "Țăndărică-Ionescu",
      };
      const result = contactFormSchema.safeParse(validRomanianData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid characters in names", () => {
      const invalidData = { ...validData, firstName: "Ion123" };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate email format", () => {
      const invalidData = { ...validData, email: "invalid-email" };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("nu este validă");
      }
    });

    it("should make phone optional", () => {
      const dataWithoutPhone = { ...validData, phone: undefined };
      const result = contactFormSchema.safeParse(dataWithoutPhone);
      expect(result.success).toBe(true);
    });

    it("should validate Romanian phone numbers", () => {
      const validPhones = ["+40123456789", "0040123456789", "0123456789"];

      validPhones.forEach((phone) => {
        const data = { ...validData, phone };
        const result = contactFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid phone numbers", () => {
      const invalidPhones = ["123456", "+1234567890", "invalid"];

      invalidPhones.forEach((phone) => {
        const data = { ...validData, phone };
        const result = contactFormSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it("should require minimum subject length", () => {
      const invalidData = { ...validData, subject: "Hi" };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "cel puțin 5 caractere"
        );
      }
    });

    it("should require minimum message length", () => {
      const invalidData = { ...validData, message: "Salut" };
      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "cel puțin 20 de caractere"
        );
      }
    });

    it("should trim whitespace from subject and message", () => {
      const dataWithWhitespace = {
        ...validData,
        subject: "  Întrebare despre platformă  ",
        message:
          "  Aș dori să aflu mai multe informații despre TBSA și cum poate ajuta asociația noastră.  ",
      };

      const result = contactFormSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.subject).toBe("Întrebare despre platformă");
        expect(result.data.message).toBe(
          "Aș dori să aflu mai multe informații despre TBSA și cum poate ajuta asociația noastră."
        );
      }
    });

    it("should convert email to lowercase", () => {
      const dataWithUppercaseEmail = {
        ...validData,
        email: "ION.POPESCU@EMAIL.COM",
      };

      const result = contactFormSchema.safeParse(dataWithUppercaseEmail);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.email).toBe("ion.popescu@email.com");
      }
    });
  });

  describe("formatPhoneNumber", () => {
    it("should format Romanian phone numbers correctly", () => {
      expect(formatPhoneNumber("+40123456789")).toBe("+40123456789");
      expect(formatPhoneNumber("0040123456789")).toBe("+40123456789");
      expect(formatPhoneNumber("0123456789")).toBe("+40123456789");
      expect(formatPhoneNumber("0123 456 789")).toBe("+40123456789");
      expect(formatPhoneNumber("0123-456-789")).toBe("+40123456789");
    });

    it("should handle edge cases", () => {
      expect(formatPhoneNumber("invalid")).toBe("invalid");
      expect(formatPhoneNumber("")).toBe("");
    });
  });
});
