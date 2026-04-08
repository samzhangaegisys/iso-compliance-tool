import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifySync } from "otplib";
import { getMfaRecord } from "./mfa-store";
import { verifyTurnstile } from "./turnstile";

// Master admin account — full access, bypasses all restrictions
const MASTER_EMAIL    = "admin@isocomply.io";
const MASTER_PASSWORD = "Admin@ISOComply1!";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "Authenticator Code", type: "text" },
        captchaToken: { label: "Captcha Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Master admin — full access, skip all other checks
        if (
          credentials.email === MASTER_EMAIL &&
          credentials.password === MASTER_PASSWORD
        ) {
          return { id: "master-admin", email: MASTER_EMAIL, name: "Admin", image: null };
        }

        // Verify CAPTCHA (uses Cloudflare Turnstile; dev test key always passes)
        const captchaToken = credentials.captchaToken as string | undefined;
        if (captchaToken) {
          const captchaValid = await verifyTurnstile(captchaToken);
          if (!captchaValid) return null;
        }

        // Check MFA
        const mfaRecord = getMfaRecord(credentials.email as string);
        if (mfaRecord?.enabled) {
          const totpCode = credentials.totpCode as string | undefined;
          if (!totpCode) return null;
          const result = verifySync({ secret: mfaRecord.secret, token: totpCode });
          const valid = typeof result === "object" ? result.valid : result;
          if (!valid) return null;
        }

        // Demo: accept any email/password. Replace with real DB lookup + bcrypt.compare in production.
        return {
          id: "demo-user-1",
          email: credentials.email as string,
          name: "Demo User",
          image: null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub ?? "";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
});
