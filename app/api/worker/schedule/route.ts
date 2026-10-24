import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DAYS, availabilityTime } from "@/lib/worker-availability";

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

        if (!Array.isArray(schedules) || schedules.length === 0 || schedules.length > 7) {
            return NextResponse.json(
                { error: "Invalid schedule format" },
                { status: 400 }
            );
        }

        const seenDays = new Set<string>();
        for (const item of schedules) {
            const label = typeof item?.day === "string" ? item.day : "a day";
            if (!DAYS.includes(item?.day)) {
                return NextResponse.json({ error: `Unknown day: ${label}` }, { status: 400 });
            }
            if (seenDays.has(item.day)) {
                return NextResponse.json({ error: `${label} is listed more than once` }, { status: 400 });
            }
            seenDays.add(item.day);

            if (typeof item.enabled !== "boolean") {
                return NextResponse.json({ error: `Choose whether you work on ${label}` }, { status: 400 });
            }
            if (!item.enabled) continue;

            const { startHour, endHour } = item;
            if (!Number.isInteger(startHour) || !Number.isInteger(endHour) || startHour < 0 || endHour > 24) {
                return NextResponse.json({ error: `Invalid hours for ${label}` }, { status: 400 });
            }
            if (endHour <= startHour) {
                return NextResponse.json({ error: `End time must be after start time on ${label}` }, { status: 400 });
            }
        }

        // Every day is saved so unchecked days stay unchecked; a day off is stored with startTime === endTime.
        // Replace in one transaction so a failed save never wipes the schedule.
        await prisma.$transaction([
            prisma.workerAvailability.deleteMany({ where: { workerId } }),
            prisma.workerAvailability.createMany({
                data: schedules.map((item) => {
                    const startTime = availabilityTime(item.enabled ? item.startHour : 0);
                    const endTime = item.enabled ? availabilityTime(item.endHour) : startTime;
                    return { workerId, day: item.day, startTime, endTime };
                }),
            }),
        ]);

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
