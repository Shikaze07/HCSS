import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function POST(req) {
    try {
        const session = await getSession()
        if (!session || session.user.role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { bookingId, rating, comment } = body

        if (!bookingId || !rating) {
            return NextResponse.json({ error: "Booking ID and rating are required" }, { status: 400 })
        }

        // Verify booking belongs to client and is COMPLETED
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                clientId: session.user.id,
                status: "COMPLETED"
            },
            include: {
                assignment: true
            }
        })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found or not eligible for review" }, { status: 404 })
        }

        if (!booking.assignment) {
            return NextResponse.json({ error: "No worker was assigned to this booking" }, { status: 400 })
        }

        // Check if already reviewed
        const existingReview = await prisma.review.findUnique({
            where: { bookingId }
        })

        if (existingReview) {
            return NextResponse.json({ error: "This booking has already been reviewed" }, { status: 400 })
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                bookingId,
                clientId: session.user.id,
                workerId: booking.assignment.workerId,
                rating: parseInt(rating),
                comment: comment || ""
            }
        })

        return NextResponse.json(review)
    } catch (error) {
        console.error("Error submitting review:", error)
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
    }
}
