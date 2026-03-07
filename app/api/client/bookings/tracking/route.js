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

        const bookings = await prisma.booking.findMany({
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
                                phone: true,
                                email: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                bookingDate: "desc",
            },
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching tracking data:", error);
        return NextResponse.json(
            { error: "Failed to fetch tracking data" },
            { status: 500 }
        );
    }
}
