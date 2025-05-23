import { cn } from "@/lib/utils";

describe("Utils", () => {
  describe("cn function", () => {
    it("should merge classes correctly", () => {
      const result = cn("text-base", "text-red-500");
      expect(result).toBe("text-base text-red-500");
    });

    it("should handle conditional classes", () => {
      const result = cn(
        "base-class",
        true && "conditional-class",
        false && "not-included"
      );
      expect(result).toBe("base-class conditional-class");
    });

    it("should handle empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle undefined and null values", () => {
      const result = cn("base-class", undefined, null, "other-class");
      expect(result).toBe("base-class other-class");
    });

    it("should handle arrays", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle objects", () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toBe("class1 class3");
    });

    it("should merge conflicting Tailwind classes correctly", () => {
      // tailwind-merge should keep the last conflicting class
      const result = cn("p-4 p-6", "text-sm text-lg");
      expect(result).toBe("p-6 text-lg");
    });

    it("should handle complex combinations", () => {
      const isError = true;
      const isDisabled = false;
      const result = cn(
        "base-button",
        "px-4 py-2",
        isError && "text-red-500",
        isDisabled && "opacity-50",
        "hover:bg-gray-100"
      );
      expect(result).toBe(
        "base-button px-4 py-2 text-red-500 hover:bg-gray-100"
      );
    });
  });
});
