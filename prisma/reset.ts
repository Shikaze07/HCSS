import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Deletes every row in every table (children first), then run `npm run db:seed`
// to put back the default admin, worker, client and services.
async function main() {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.workerAssignment.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.workerAvailability.deleteMany(),
    prisma.session.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log("All data deleted.");
}

main()
  .catch((e) => {
    console.error("Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
