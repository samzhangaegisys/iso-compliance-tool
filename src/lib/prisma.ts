// Prisma client singleton
// Note: Run `npx prisma generate` after setting up your database to generate
// the Prisma client. The client requires DATABASE_URL to be set and
// `prisma generate` to be executed before it can be used.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaInstance: any = null;

export function getPrisma() {
  if (prismaInstance) return prismaInstance;
  try {
    // Dynamic require to avoid build failures when client isn't generated
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = globalThis as unknown as {
      prisma: typeof PrismaClient | undefined;
    };
    prismaInstance =
      globalForPrisma.prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
    return prismaInstance;
  } catch {
    return null;
  }
}

export const prisma = getPrisma();
