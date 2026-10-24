import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();

        if (!session || session.user.role !== "CLIENT") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const clientId = session.user.id;

        // 1. Next upcoming or active booking
        const nextBooking = await prisma.booking.findFirst({
            where: {
                clientId,
                status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
            },
            include: {
                service: true,
                assignment: {
                    include: {
                        worker: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                bookingDate: "asc",
            },
        });

        // 2. Client Stats
        const totalBookings = await prisma.booking.count({ where: { clientId } });
        const completedCount = await prisma.booking.count({
            where: { clientId, status: "COMPLETED" },
        });

        const completedBookings = await prisma.booking.findMany({
            where: { clientId, status: "COMPLETED" },
            select: { totalAmount: true },
        });
        const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

        // 3. Recent Bookings (last 4)
        const recentBookings = await prisma.booking.findMany({
            where: { clientId },
            take: 4,
            orderBy: { bookingDate: "desc" },
            include: {
                service: true,
                assignment: {
                    include: {
                        worker: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        // 4. Featured Services
        const featuredServices = await prisma.service.findMany({
            where: { status: true },
            take: 4,
        });

        return NextResponse.json({
            clientName: `${session.user.firstName} ${session.user.lastName}`,
            nextBooking,
            stats: {
                totalBookings,
                completedCount,
                totalSpent,
            },
            recentBookings,
            featuredServices,
        });
    } catch (error) {
        console.error("Error fetching client dashboard:", error);
        return NextResponse.json(
            { error: "Failed to load dashboard data" },
            { status: 500 }
        );
    }
}
