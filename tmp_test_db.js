
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client/index.js";
import "dotenv/config";

async function testConnection() {
    console.log("Testing connection with:");
    console.log("Host:", `[${process.env.DB_HOST}]`);
    console.log("Port:", process.env.DB_PORT);
    console.log("User:", process.env.DB_USER);
    console.log("Database:", process.env.DB_NAME);

    const adapter = new PrismaMariaDb({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? "3306", 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 1,
        connectTimeout: 5000,
    });

    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Attempting to connect...");
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        console.log("Connection successful:", result);
    } catch (error) {
        console.error("Connection failed:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
