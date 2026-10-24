import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { checkWorkerAvailability, getBookingProblem } from "@/lib/worker-availability"

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

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
        const session = await getSession()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { bookingId, workerId } = body

        if (typeof bookingId !== "string" || typeof workerId !== "string" || !bookingId || !workerId) {
            return NextResponse.json(
                { error: "Booking ID and Worker ID are required" },
                { status: 400 }
            )
        }

        const worker = await prisma.user.findUnique({
            where: { id: workerId },
            select: { role: true, status: true },
        })
        if (!worker || worker.role !== "WORKER") {
            return NextResponse.json({ error: "Worker not found" }, { status: 404 })
        }
        if (worker.status !== "ACTIVE") {
            return NextResponse.json({ error: "This worker's account is not active" }, { status: 400 })
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

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { id: true, startTime: true, endTime: true, status: true },
        })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        const bookingProblem = getBookingProblem(booking)
        if (bookingProblem) {
            return NextResponse.json({ error: bookingProblem }, { status: 400 })
        }

        const conflict = await checkWorkerAvailability(workerId, booking)
        if (conflict) {
            return NextResponse.json(
                { error: `This worker is not available for this booking: ${conflict}` },
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
