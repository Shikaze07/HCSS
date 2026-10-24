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

async function main() {
  console.log("🌱 Seeding default users and initial data...");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const users: Record<string, any> = {};
  for (const userData of defaultUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
      },
    });
    users[user.role] = user;

    console.log(
      `✅ ${user.role} user seeded: ${user.email} (id: ${user.id})`
    );
  }

  // Seed Services
  const services: any[] = [];
  for (const s of defaultServices) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (existing) {
      services.push(existing);
    } else {
      const created = await prisma.service.create({ data: s });
      services.push(created);
      console.log(`✅ Service seeded: ${created.name}`);
    }
  }

  // Seed Sample Bookings if none exist
  const bookingCount = await prisma.booking.count();
  if (bookingCount === 0 && users[Role.CLIENT] && users[Role.WORKER] && services.length > 0) {
    console.log("🌱 Seeding initial bookings, assignments, payments & reviews...");

    const client = users[Role.CLIENT];
    const worker = users[Role.WORKER];

    // 1. Completed Booking with Payment & Review
    const b1 = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: services[0].id,
        bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 9 * 3600 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 11 * 3600 * 1000),
        address: "742 Evergreen Terrace, Springfield",
        duration: 120,
        totalAmount: 1200.0,
        status: "COMPLETED",
        assignment: {
          create: {
            workerId: worker.id,
            status: "COMPLETED",
          },
        },
        payment: {
          create: {
            amount: 1200.0,
            method: "GCASH",
            paymentStatus: "PAID",
            paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
        },
        review: {
          create: {
            clientId: client.id,
            workerId: worker.id,
            rating: 5,
            comment: "Exceptional cleaning service! The house was spotless and smelled wonderful.",
          },
        },
      },
    });

    // 2. Completed Deep Cleaning with Card Payment
    const b2 = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: services[1].id,
        bookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 13 * 3600 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 17 * 3600 * 1000),
        address: "10880 Wilshire Blvd, Los Angeles",
        duration: 240,
        totalAmount: 2500.0,
        status: "COMPLETED",
        assignment: {
          create: {
            workerId: worker.id,
            status: "COMPLETED",
          },
        },
        payment: {
          create: {
            amount: 2500.0,
            method: "CARD",
            paymentStatus: "PAID",
            paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        },
        review: {
          create: {
            clientId: client.id,
            workerId: worker.id,
            rating: 5,
            comment: "Very detailed work on the kitchen and bathrooms. Highly recommended!",
          },
        },
      },
    });

    // 3. In Progress Booking (Active task for worker)
    const b3 = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: services[3].id,
        bookingDate: new Date(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 3 * 3600 * 1000),
        address: "450 Ocean Drive, Suite 12B, Metro",
        duration: 180,
        totalAmount: 1800.0,
        status: "IN_PROGRESS",
        assignment: {
          create: {
            workerId: worker.id,
            status: "IN_PROGRESS",
          },
        },
        payment: {
          create: {
            amount: 1800.0,
            method: "CASH",
            paymentStatus: "PENDING",
          },
        },
      },
    });

    // 4. Confirmed Upcoming Booking
    const b4 = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: services[2].id,
        bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 3600 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 15 * 3600 * 1000),
        address: "221B Baker St, West District",
        duration: 300,
        totalAmount: 3200.0,
        status: "CONFIRMED",
        assignment: {
          create: {
            workerId: worker.id,
            status: "ACCEPTED",
          },
        },
        payment: {
          create: {
            amount: 3200.0,
            method: "GCASH",
            paymentStatus: "PENDING",
          },
        },
      },
    });

    // 5. Pending Booking (unassigned, for admin booking management)
    const b5 = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: services[0].id,
        bookingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 8 * 3600 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 10 * 3600 * 1000),
        address: "88 Sunrise Heights, East Bay",
        duration: 120,
        totalAmount: 1200.0,
        status: "PENDING",
      },
    });

    console.log(`✅ Seeded 5 initial bookings with assignments, payments, and reviews.`);
  }

  // Seed default worker availability
  if (users[Role.WORKER]) {
    const worker = users[Role.WORKER];
    const availCount = await prisma.workerAvailability.count({ where: { workerId: worker.id } });
    if (availCount === 0) {
      const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
      for (const day of days) {
        await prisma.workerAvailability.create({
          data: {
            workerId: worker.id,
            day: day as any,
            startTime: new Date(1970, 0, 1, 8, 0),
            endTime: new Date(1970, 0, 1, 17, 0),
          },
        });
      }
      console.log("✅ Seeded default availability schedule for worker.");
    }
  }

  console.log("\n✨ Seeding complete!");
  console.log(`   Default password: ${DEFAULT_PASSWORD}`);
  console.log("   Users created:");
  console.log("     - admin@hcss.com  (ADMIN)");
  console.log("     - worker@hcss.com (WORKER)");
  console.log("     - client@hcss.com (CLIENT)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
