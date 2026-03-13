
// Using a .ts extension and running with ts-node or just using node if it's compiled.
// Actually, let's just use a simple script that imports from @/lib/prisma
// Since this is a Next.js project, running standalone scripts that use path aliases is tricky.

import prisma from "./lib/prisma.js";

async function verifyConnection() {
    try {
        console.log("Attempting to fetch services using prisma lib...");
        const services = await prisma.service.findMany({ take: 1 });
        console.log("Success! Services fetched:", services);
    } catch (error) {
        console.error("Verification failed:");
        console.error(error);
    } finally {
        // We don't want to disconnect if it's the global instance, 
        // but for a standalone script it's fine.
        await prisma.$disconnect();
    }
}

verifyConnection();
