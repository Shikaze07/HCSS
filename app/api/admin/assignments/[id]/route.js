import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { checkWorkerAvailability } from "@/lib/worker-availability"

const STATUSES = ["ASSIGNED", "ACCEPTED", "DECLINED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED"]

export async function PATCH(req, { params }) {
    try {
        const session = await getSession()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { workerId, status } = body

        if (status !== undefined && !STATUSES.includes(status)) {
            return NextResponse.json({ error: "Invalid assignment status" }, { status: 400 })
        }
        if (workerId !== undefined && (typeof workerId !== "string" || !workerId)) {
            return NextResponse.json({ error: "Invalid worker" }, { status: 400 })
        }

        const current = await prisma.workerAssignment.findUnique({
            where: { id },
            select: { workerId: true, booking: { select: { id: true, startTime: true, endTime: true } } },
        })

        if (!current) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
        }

        // Only check the schedule when moving the job to a different worker
        if (workerId && workerId !== current.workerId) {
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

            const conflict = await checkWorkerAvailability(workerId, current.booking)
            if (conflict) {
                return NextResponse.json(
                    { error: `This worker is not available for this booking: ${conflict}` },
                    { status: 400 }
                )
            }
        }

        const updatedAssignment = await prisma.workerAssignment.update({
            where: { id },
            data: {
                workerId,
                status,
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

        return NextResponse.json(updatedAssignment)
    } catch (error) {
        console.error("Error updating assignment:", error)
        return NextResponse.json(
            { error: "Failed to update assignment" },
            { status: 500 }
        )
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getSession()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        // Get the bookingId before deletion to update the booking status
        const assignment = await prisma.workerAssignment.findUnique({
            where: { id },
            select: { bookingId: true }
        });

        if (assignment) {
            await prisma.workerAssignment.delete({
                where: { id },
            });

            await prisma.booking.update({
                where: { id: assignment.bookingId },
                data: { status: "PENDING" }
            });
        }

        return NextResponse.json({ message: "Assignment deleted successfully" })
    } catch (error) {
        console.error("Error deleting assignment:", error)
        return NextResponse.json(
            { error: "Failed to delete assignment" },
            { status: 500 }
        )
    }
}
