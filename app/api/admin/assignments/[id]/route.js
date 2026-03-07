import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(req, { params }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { workerId, status } = body

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
        const { id } = await params
        await prisma.workerAssignment.delete({
            where: { id },
        })
        return NextResponse.json({ message: "Assignment deleted successfully" })
    } catch (error) {
        console.error("Error deleting assignment:", error)
        return NextResponse.json(
            { error: "Failed to delete assignment" },
            { status: 500 }
        )
    }
}
