// 1. IMPORT FROM YOUR LOCALLY GENERATED CLIENT (Prisma 7 Standard)
import { PrismaClient } from "../generated/prisma/client"; 
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// 2. Pass configuration parameters DIRECTLY to the adapter (Prisma 7 API style)
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db"
});

// 3. Keep the Next.js hot-reloading safeguard intact
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, 
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;