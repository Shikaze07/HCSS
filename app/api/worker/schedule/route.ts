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

        // Fetch all assignments with booking details
        const assignments = await prisma.workerAssignment.findMany({
            where: {
                workerId,
            },
            include: {
                booking: {
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
                    },
                },
            },
            orderBy: {
                booking: {
                    bookingDate: "asc",
                },
            },
        });

        // Fetch worker availability
        const availability = await prisma.workerAvailability.findMany({
            where: {
                workerId,
            },
            orderBy: {
                day: "asc",
            },
        });

        return NextResponse.json({
            assignments,
            availability,
        });
    } catch (error) {
        console.error("Error fetching worker schedule:", error);
        return NextResponse.json(
            { error: "Failed to fetch schedule data" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();

        if (!session || session.user.role !== "WORKER") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const workerId = session.user.id;
        const body = await req.json();
        const { schedules } = body; // Array of { day: 'MON', enabled: boolean, startHour: 8, endHour: 17 }

        if (!Array.isArray(schedules)) {
            return NextResponse.json(
                { error: "Invalid schedule format" },
                { status: 400 }
            );
        }

        // Remove existing availability and replace with new
        await prisma.workerAvailability.deleteMany({
            where: { workerId },
        });

        for (const item of schedules) {
            if (item.enabled) {
                const startTime = new Date(1970, 0, 1, item.startHour || 8, 0);
                const endTime = new Date(1970, 0, 1, item.endHour || 17, 0);

                await prisma.workerAvailability.create({
                    data: {
                        workerId,
                        day: item.day,
                        startTime,
                        endTime,
                    },
                });
            }
        }

        const updatedAvailability = await prisma.workerAvailability.findMany({
            where: { workerId },
        });

        return NextResponse.json(updatedAvailability);
    } catch (error) {
        console.error("Error saving worker availability:", error);
        return NextResponse.json(
            { error: "Failed to update availability" },
            { status: 500 }
        );
    }
}
