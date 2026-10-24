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

        const history = await prisma.booking.findMany({
            where: {
                clientId: session.user.id,
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
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                payment: true,
                review: true,
            },
            orderBy: {
                bookingDate: "desc",
            },
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("Error fetching client service history:", error);
        return NextResponse.json(
            { error: "Failed to fetch service history" },
            { status: 500 }
        );
    }
}

// Submit a review for a completed service
export async function POST(req) {
    try {
        const session = await getSession();

        if (!session || session.user.role !== "CLIENT") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { bookingId, rating, comment } = body;

        if (!bookingId || !rating) {
            return NextResponse.json(
                { error: "Booking ID and rating (1-5) are required" },
                { status: 400 }
            );
        }

        // Verify booking belongs to client and is completed
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { assignment: true, review: true },
        });

        if (!booking || booking.clientId !== session.user.id) {
            return NextResponse.json(
                { error: "Booking not found or unauthorized" },
                { status: 404 }
            );
        }

        if (booking.review) {
            return NextResponse.json(
                { error: "This booking has already been reviewed" },
                { status: 400 }
            );
        }

        const workerId = booking.assignment?.workerId;
        if (!workerId) {
            return NextResponse.json(
                { error: "No worker assigned to this booking" },
                { status: 400 }
            );
        }

        const review = await prisma.review.create({
            data: {
                bookingId,
                clientId: session.user.id,
                workerId,
                rating: Number(rating),
                comment: comment || null,
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { error: "Failed to submit review" },
            { status: 500 }
        );
    }
}
