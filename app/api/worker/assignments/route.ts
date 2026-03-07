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

        const assignments = await prisma.workerAssignment.findMany({
            where: {
                workerId: workerId,
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
                            }
                        },
                        service: true,
                    },
                },
            },
            orderBy: {
                assignedAt: "desc",
            },
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error("Error fetching worker assignments:", error);
        return NextResponse.json(
            { error: "Failed to fetch assignments" },
            { status: 500 }
        );
    }
}
