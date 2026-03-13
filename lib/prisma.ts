import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

type GlobalWithPrisma = {
  prismaAdapter: PrismaMariaDb | undefined;
  prisma: PrismaClient | undefined;
};

const globalForPrisma = globalThis as unknown as GlobalWithPrisma;

// Persist the adapter globally so HMR doesn't create a new connection pool each reload
const adapter =
  globalForPrisma.prismaAdapter ??
  new PrismaMariaDb({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    connectionLimit: 10,
    connectTimeout: 30000,
  });

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAdapter = adapter;
  globalForPrisma.prisma = prisma;
}

export default prisma;