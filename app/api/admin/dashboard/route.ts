import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 1. KPI Counts
        const totalUsers = await prisma.user.count();
        const totalClients = await prisma.user.count({ where: { role: "CLIENT" } });
        const totalWorkers = await prisma.user.count({ where: { role: "WORKER" } });
        
        const totalBookings = await prisma.booking.count();
        const pendingBookings = await prisma.booking.count({ where: { status: "PENDING" } });
        const inProgressBookings = await prisma.booking.count({ where: { status: "IN_PROGRESS" } });
        const completedBookings = await prisma.booking.count({ where: { status: "COMPLETED" } });

        // Unassigned bookings needing dispatch
        const unassignedBookingsCount = await prisma.booking.count({
            where: {
                assignment: null,
                status: { notIn: ["COMPLETED", "CANCELLED"] },
            },
        });

        // Total Revenue from paid payments
        const payments = await prisma.payment.findMany({
            where: { paymentStatus: "PAID" },
        });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        // 2. Recent Bookings for the live operations feed
        const recentBookings = await prisma.booking.findMany({
            take: 6,
            orderBy: { createdAt: "desc" },
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
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
                payment: true,
            },
        });

        // 3. Service Popularity Breakdown
        const services = await prisma.service.findMany({
            include: {
                _count: {
                    select: { bookings: true },
                },
            },
            take: 5,
        });

        return NextResponse.json({
            kpi: {
                totalRevenue,
                totalBookings,
                pendingBookings,
                inProgressBookings,
                completedBookings,
                unassignedBookingsCount,
                totalClients,
                totalWorkers,
                totalUsers,
            },
            recentBookings,
            popularServices: services.map((s) => ({
                id: s.id,
                name: s.name,
                price: s.price,
                duration: s.duration,
                bookingCount: s._count.bookings,
            })),
        });
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
