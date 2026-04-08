// Password complexity aligned with NIST SP 800-63B, OWASP, and ISO 27001 A.9.4.3
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

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


export type PasswordCheck = {
  label: string;
  pass: boolean;
};

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: "At least 12 characters",       pass: password.length >= 12 },
    { label: "Uppercase letter (A–Z)",        pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a–z)",        pass: /[a-z]/.test(password) },
    { label: "Number (0–9)",                  pass: /[0-9]/.test(password) },
    { label: "Special character (!@#$…)",     pass: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordChecks(password).every((c) => c.pass);
}

export function passwordStrength(password: string): "weak" | "fair" | "strong" | "very-strong" {
  const passed = getPasswordChecks(password).filter((c) => c.pass).length;
  if (passed <= 1) return "weak";
  if (passed <= 3) return "fair";
  if (passed === 4) return "strong";
  return "very-strong";
}
