import bcrypt from "bcryptjs";

/**
 * Password service for hashing and verification
 */
export class PasswordService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    if (!password || password.trim().length === 0) {
      throw new Error("Password cannot be empty");
    }

    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    if (!password || password.trim().length === 0) {
      throw new Error("Password cannot be empty");
    }

    if (!hashedPassword) {
      throw new Error("Hashed password cannot be empty");
    }

    return bcrypt.compare(password, hashedPassword);
  }
}
