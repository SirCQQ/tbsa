import { faker } from "@faker-js/faker";

// Mock password data factories
export const createMockHashedPassword = (): string => {
  // Simulate bcrypt hash format: $2b$10$...
  return `$2b$10$${faker.string.alphanumeric(53)}`;
};

export const createMockPlainPassword = (): string => {
  return faker.internet.password({
    length: faker.number.int({ min: 8, max: 20 }),
    memorable: false,
    pattern: /[A-Za-z0-9!@#$%^&*]/,
  });
};

export const createMockWeakPassword = (): string => {
  return faker.helpers.arrayElement([
    "123456",
    "password",
    "qwerty",
    "abc123",
    "password123",
  ]);
};

export const createMockStrongPassword = (): string => {
  const uppercase = faker.string.alpha({ length: 2, casing: "upper" });
  const lowercase = faker.string.alpha({ length: 4, casing: "lower" });
  const numbers = faker.string.numeric(2);
  const symbols = faker.helpers.arrayElement([
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
  ]);

  return faker.helpers
    .shuffle([...uppercase, ...lowercase, ...numbers, symbols])
    .join("");
};

// Mock implementations for the actual PasswordService methods
export const mockHashPassword = jest
  .fn()
  .mockImplementation(async (password: string): Promise<string> => {
    if (!password || password.trim().length === 0) {
      throw new Error("Password cannot be empty");
    }
    return createMockHashedPassword();
  });

export const mockVerifyPassword = jest
  .fn()
  .mockImplementation(
    async (password: string, hashedPassword: string): Promise<boolean> => {
      if (!password || password.trim().length === 0) {
        throw new Error("Password cannot be empty");
      }
      if (!hashedPassword) {
        throw new Error("Hashed password cannot be empty");
      }
      // For testing, return true if password is "correct" or false otherwise
      return password === "correct";
    }
  );

// Mock PasswordService class to match the real service
export const mockPasswordService = {
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
};

// Export all mocks as default
export default {
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
  // Data factories
  createMockHashedPassword,
  createMockPlainPassword,
  createMockWeakPassword,
  createMockStrongPassword,
};
