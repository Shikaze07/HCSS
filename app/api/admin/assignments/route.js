import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const assignments = await prisma.workerAssignment.findMany({
            include: {
                booking: {
                    include: {
                        client: true,
                        service: true,
                    },
                },
                worker: true,
            },
            orderBy: {
                assignedAt: "desc",
            },
        })
        return NextResponse.json(assignments)
    } catch (error) {
        console.error("Error fetching assignments:", error)
        return NextResponse.json(
            { error: "Failed to fetch assignments" },
            { status: 500 }
        )
    }
}

export async function POST(req) {
    try {
        const body = await req.json()
        const { bookingId, workerId } = body

        if (!bookingId || !workerId) {
            return NextResponse.json(
                { error: "Booking ID and Worker ID are required" },
                { status: 400 }
            )
        }

        // Check if booking already assigned
        const existing = await prisma.workerAssignment.findUnique({
            where: { bookingId },
        })

        if (existing) {
            return NextResponse.json(
                { error: "This booking is already assigned to a worker" },
                { status: 400 }
            )
        }

        const assignment = await prisma.workerAssignment.create({
            data: {
                bookingId,
                workerId,
                status: "ASSIGNED",
            },
            include: {
                booking: {
                    include: {
                        client: true,
                        service: true,
                    },
                },
                worker: true,
            },
        })

        // Update booking status separately to be robust
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CONFIRMED" }
        })

        return NextResponse.json(assignment)
    } catch (error) {
        console.error("Error creating assignment:", error)
        return NextResponse.json(
            { error: "Failed to create assignment" },
            { status: 500 }
        )
    }
}
