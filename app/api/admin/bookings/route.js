import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get("all");
        const status = searchParams.get("status");

        const where = {};

        // If not requesting all bookings, default to unassigned (used by Worker Assignment modal)
        if (!all) {
            where.assignment = null;
        } else if (status && status !== "ALL") {
            where.status = status;
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                client: {
                    select: {
                        id: true,
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
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                payment: true,
            },
            orderBy: {
                bookingDate: "desc",
            },
        });
        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}

export async function PATCH(req) {
    try {
        const body = await req.json();
        const { id, status, bookingDate, startTime, endTime } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Booking ID is required" },
                { status: 400 }
            );
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (bookingDate) updateData.bookingDate = new Date(bookingDate);
        if (startTime) updateData.startTime = new Date(startTime);
        if (endTime) updateData.endTime = new Date(endTime);

        const updated = await prisma.booking.update({
            where: { id },
            data: updateData,
            include: {
                client: true,
                service: true,
                assignment: {
                    include: {
                        worker: true,
                    },
                },
                payment: true,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json(
            { error: "Failed to update booking" },
            { status: 500 }
        );
    }
}
