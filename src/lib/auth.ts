import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error("Password cannot be empty");
  }

  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
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
