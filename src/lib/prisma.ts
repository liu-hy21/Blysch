import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaBlysch?: PrismaClient;
  prismaMemoryHidden?: PrismaClient;
  prismaMood?: PrismaClient;
  prismaWishWhen?: PrismaClient;
};

function withPoolParams(url: string) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("connectionLimit")) {
    parsed.searchParams.set("connectionLimit", "5");
  }
  if (!parsed.searchParams.has("idleTimeout")) {
    parsed.searchParams.set("idleTimeout", "30");
  }
  if (!parsed.searchParams.has("acquireTimeout")) {
    parsed.searchParams.set("acquireTimeout", "15000");
  }
  return parsed.toString();
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({
    adapter: new PrismaMariaDb(withPoolParams(url)),
  });
}

for (const key of ["prisma", "prismaBlysch", "prismaMemoryHidden", "prismaMood"] as const) {
  const stale = globalForPrisma[key];
  if (stale && stale !== globalForPrisma.prismaWishWhen) {
    void stale.$disconnect();
    globalForPrisma[key] = undefined;
  }
}

export const prisma = globalForPrisma.prismaWishWhen ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaWishWhen = prisma;
}
