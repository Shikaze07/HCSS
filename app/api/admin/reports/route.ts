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

        // 1. Overview KPIs
        const totalBookings = await prisma.booking.count();
        const completedBookings = await prisma.booking.count({ where: { status: "COMPLETED" } });
        const pendingBookings = await prisma.booking.count({ where: { status: "PENDING" } });
        const confirmedBookings = await prisma.booking.count({ where: { status: "CONFIRMED" } });
        const inProgressBookings = await prisma.booking.count({ where: { status: "IN_PROGRESS" } });
        const cancelledBookings = await prisma.booking.count({ where: { status: "CANCELLED" } });

        const totalClients = await prisma.user.count({ where: { role: "CLIENT" } });
        const totalWorkers = await prisma.user.count({ where: { role: "WORKER" } });

        // Total revenue from completed payments
        const payments = await prisma.payment.findMany({
            where: { paymentStatus: "PAID" },
        });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        // 2. Service Demand Analytics
        const services = await prisma.service.findMany({
            include: {
                bookings: {
                    select: {
                        id: true,
                        totalAmount: true,
                        status: true,
                    },
                },
            },
        });

        const serviceDemand = services.map((s) => {
            const count = s.bookings.length;
            const completedCount = s.bookings.filter((b) => b.status === "COMPLETED").length;
            const revenue = s.bookings
                .filter((b) => b.status === "COMPLETED")
                .reduce((sum, b) => sum + b.totalAmount, 0);

            return {
                id: s.id,
                name: s.name,
                price: s.price,
                totalBookings: count,
                completedBookings: completedCount,
                revenue,
            };
        }).sort((a, b) => b.totalBookings - a.totalBookings);

        // 3. Worker Performance Reports
        const workers = await prisma.user.findMany({
            where: { role: "WORKER" },
            include: {
                workerAssignments: {
                    include: {
                        booking: true,
                    },
                },
                reviewsReceived: true,
            },
        });

        const workerPerformance = workers.map((w) => {
            const totalAssigned = w.workerAssignments.length;
            const completedJobs = w.workerAssignments.filter(
                (a) => a.status === "COMPLETED" || a.booking?.status === "COMPLETED"
            ).length;
            const revenueGenerated = w.workerAssignments
                .filter((a) => a.booking?.status === "COMPLETED")
                .reduce((sum, a) => sum + (a.booking?.totalAmount || 0), 0);

            const ratings = w.reviewsReceived.map((r) => r.rating);
            const avgRating = ratings.length > 0
                ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
                : 5.0;

            return {
                id: w.id,
                name: `${w.firstName} ${w.lastName}`,
                email: w.email,
                phone: w.phone,
                totalAssigned,
                completedJobs,
                revenueGenerated,
                avgRating,
                reviewCount: ratings.length,
            };
        }).sort((a, b) => b.completedJobs - a.completedJobs);

        // 4. Customer Ratings & Reviews
        const reviews = await prisma.review.findMany({
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                worker: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                booking: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
        });

        const allReviews = await prisma.review.findMany({ select: { rating: true } });
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        allReviews.forEach((r) => {
            if (r.rating in ratingDistribution) {
                // @ts-ignore
                ratingDistribution[r.rating]++;
            }
        });

        const overallAvgRating = allReviews.length > 0
            ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
            : "5.0";

        // 5. Payment Methods
        const paymentMethods: Record<string, number> = {};
        payments.forEach((p) => {
            paymentMethods[p.method] = (paymentMethods[p.method] || 0) + p.amount;
        });

        return NextResponse.json({
            kpi: {
                totalRevenue,
                totalBookings,
                completedBookings,
                pendingBookings,
                confirmedBookings,
                inProgressBookings,
                cancelledBookings,
                totalClients,
                totalWorkers,
                overallAvgRating,
                totalReviews: allReviews.length,
            },
            serviceDemand,
            workerPerformance,
            recentReviews: reviews,
            ratingDistribution,
            paymentMethods,
        });
    } catch (error) {
        console.error("Error generating admin reports:", error);
        return NextResponse.json(
            { error: "Failed to generate reports" },
            { status: 500 }
        );
    }
}
