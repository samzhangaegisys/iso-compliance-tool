// Server-only password utilities — uses Node.js crypto (not safe to import in client components).
// For client-side password checks, import from @/lib/password-checks instead.

import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

export { getPasswordChecks, isPasswordStrong, passwordStrength } from "./password-checks";
export type { PasswordCheck } from "./password-checks";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  if (derivedKey.length !== keyBuffer.length) return false;
  return timingSafeEqual(derivedKey, keyBuffer);
}
