import type { NextConfig } from "next";

// Security headers aligned with:
// • OWASP Secure Headers Project
// • ISO 27001 A.14 (System acquisition / security in dev)
// • NIST SP 800-53 SC-8, SC-28
// • SOC 2 CC6 (Logical and Physical Access Controls)

const securityHeaders = [
  // Prevent MIME-type sniffing (OWASP A05)
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Block clickjacking (OWASP A05)
  { key: "X-Frame-Options",           value: "DENY" },
  // Force HTTPS for 2 years, include subdomains (HSTS)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Control referrer info sent to third parties
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Cross-origin isolation
  { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Content Security Policy — allow Cloudflare Turnstile + pravatar.cc images
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + Cloudflare Turnstile
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      // Frames: Cloudflare Turnstile challenge iframe
      "frame-src https://challenges.cloudflare.com",
      // Styles: self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline'",
      // Images: self + data URIs (QR codes) + pravatar.cc (chat agent photo)
      "img-src 'self' data: https://i.pravatar.cc",
      // Connect: self + NextAuth + Cloudflare
      "connect-src 'self' https://challenges.cloudflare.com",
      // Fonts: self
      "font-src 'self'",
      // Block all objects/embeds
      "object-src 'none'",
      // Base URI restriction
      "base-uri 'self'",
      // Form targets
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Disable x-powered-by header (information disclosure)
  poweredByHeader: false,
};

export default nextConfig;
