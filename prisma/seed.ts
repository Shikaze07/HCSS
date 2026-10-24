import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, UserStatus } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DEFAULT_PASSWORD = "Password123";
const SALT_ROUNDS = 10;

const defaultUsers = [
  {
    firstName: "Admin",
    middleName: null,
    lastName: "User",
    email: "admin@hcss.com",
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Worker",
    middleName: null,
    lastName: "User",
    email: "worker@hcss.com",
    role: Role.WORKER,
    status: UserStatus.ACTIVE,
  },
  {
    firstName: "Client",
    middleName: null,
    lastName: "User",
    email: "client@hcss.com",
    role: Role.CLIENT,
    status: UserStatus.ACTIVE,
  },
];

const defaultServices = [
  {
    name: "General House Cleaning",
    description: "Standard dusting, sweeping, mopping, vacuuming, and trash disposal for homes and apartments.",
    price: 1200.0,
    duration: 120,
    status: true,
  },
  {
    name: "Deep Cleaning Service",
    description: "Thorough intensive cleaning including behind appliances, baseboards, grout, and high-touch disinfection.",
    price: 2500.0,
    duration: 240,
    status: true,
  },
  {
    name: "Move-in / Move-out Cleaning",
    description: "Complete sanitized turnaround service for vacant homes, apartments, and commercial units.",
    price: 3200.0,
    duration: 300,
    status: true,
  },
  {
    name: "Kitchen & Bathroom Sanitization",
    description: "Targeted heavy grease removal, limescale treatment, and steam sterilization of moisture-prone areas.",
    price: 1800.0,
    duration: 180,
    status: true,
  },
  {
    name: "Post-Construction Cleaning",
    description: "Removal of renovation dust, paint specks, adhesives, and detailed polishing before occupancy.",
    price: 4500.0,
    duration: 360,
    status: true,
  },
];

// Seeds only the three default accounts and the service catalog.
// Bookings, assignments, payments, reviews and worker availability start empty.
async function main() {
  console.log("Seeding default users and services...");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const userData of defaultUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
      },
    });

    console.log(`${user.role} user seeded: ${user.email} (id: ${user.id})`);
  }

  for (const s of defaultServices) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      const created = await prisma.service.create({ data: s });
      console.log(`Service seeded: ${created.name}`);
    }
  }

  console.log("\nSeeding complete!");
  console.log(`   Default password: ${DEFAULT_PASSWORD}`);
  console.log("   Users created:");
  console.log("     - admin@hcss.com  (ADMIN)");
  console.log("     - worker@hcss.com (WORKER)");
  console.log("     - client@hcss.com (CLIENT)");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
