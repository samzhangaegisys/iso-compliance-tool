// Password complexity aligned with NIST SP 800-63B, OWASP, and ISO 27001 A.9.4.3

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
