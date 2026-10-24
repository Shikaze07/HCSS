import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();

        if (!session || session.user.role !== "WORKER") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const workerId = session.user.id;

        // 1. Current Active Task (IN_PROGRESS, ON_THE_WAY, ARRIVED, or ACCEPTED)
        const currentTask = await prisma.workerAssignment.findFirst({
            where: {
                workerId,
                status: { in: ["IN_PROGRESS", "ON_THE_WAY", "ARRIVED", "ACCEPTED", "ASSIGNED"] },
            },
            include: {
                booking: {
                    include: {
                        service: true,
                        client: {
                            select: {
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
                booking: {
                    bookingDate: "asc",
                },
            },
        });

        // 2. All Worker Assignments
        const allAssignments = await prisma.workerAssignment.findMany({
            where: { workerId },
            include: {
                booking: {
                    include: {
                        service: true,
                        client: true,
                    },
                },
            },
            orderBy: {
                booking: {
                    bookingDate: "asc",
                },
            },
        });

        const todayStr = new Date().toDateString();
        const todayTasks = allAssignments.filter(
            (a) => new Date(a.booking?.bookingDate).toDateString() === todayStr
        );
        const completedTasks = allAssignments.filter((a) => a.status === "COMPLETED");
        const upcomingTasks = allAssignments.filter(
            (a) => a.status !== "COMPLETED" && a.status !== "DECLINED"
        );

        // 3. Worker Reviews and Average Rating
        const reviews = await prisma.review.findMany({
            where: { workerId },
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                booking: {
                    include: { service: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
        });

        const allWorkerReviews = await prisma.review.findMany({
            where: { workerId },
            select: { rating: true },
        });

        const avgRating = allWorkerReviews.length > 0
            ? (allWorkerReviews.reduce((sum, r) => sum + r.rating, 0) / allWorkerReviews.length).toFixed(1)
            : "5.0";

        return NextResponse.json({
            workerName: `${session.user.firstName} ${session.user.lastName}`,
            currentTask,
            stats: {
                todayCount: todayTasks.length,
                upcomingCount: upcomingTasks.length,
                completedCount: completedTasks.length,
                avgRating,
                reviewCount: allWorkerReviews.length,
            },
            todayTasks,
            recentReviews: reviews,
        });
    } catch (error) {
        console.error("Error fetching worker dashboard:", error);
        return NextResponse.json(
            { error: "Failed to load worker dashboard" },
            { status: 500 }
        );
    }
}
