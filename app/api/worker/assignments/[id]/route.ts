import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        const { id } = await params;

        if (!session || session.user.role !== "WORKER") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            );
        }

        // Verify the assignment belongs to the worker
        const assignment = await prisma.workerAssignment.findUnique({
            where: { id },
        });

        if (!assignment || assignment.workerId !== session.user.id) {
            return NextResponse.json(
                { error: "Assignment not found or unauthorized" },
                { status: 404 }
            );
        }

        // Determine the corresponding Booking status
        let bookingStatus: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
        if (status === "ACCEPTED") bookingStatus = "CONFIRMED";
        if (status === "ON_THE_WAY") bookingStatus = "CONFIRMED";
        if (status === "ARRIVED") bookingStatus = "CONFIRMED";
        if (status === "IN_PROGRESS") bookingStatus = "IN_PROGRESS";
        if (status === "COMPLETED") bookingStatus = "COMPLETED";
        if (status === "DECLINED") bookingStatus = "PENDING";

        const updatedAssignment = await prisma.workerAssignment.update({
            where: { id },
            data: {
                status,
                booking: bookingStatus ? {
                    update: { status: bookingStatus }
                } : undefined
            },
            include: {
                booking: {
                    include: {
                        client: true,
                        service: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedAssignment);
    } catch (error) {
        console.error("Error updating assignment status:", error);
        return NextResponse.json(
            { error: "Failed to update assignment" },
            { status: 500 }
        );
    }
}
