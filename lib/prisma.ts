import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

type GlobalWithPrisma = {
  prisma: PrismaClient | undefined;
};

const globalForPrisma = globalThis as unknown as GlobalWithPrisma;

// Persist the client globally so HMR doesn't create a new connection pool each reload
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;