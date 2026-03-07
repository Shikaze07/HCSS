import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const session = await getSession()

        if (!session || session.user.role !== "CLIENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const booking = await prisma.booking.findFirst({
            where: {
                id: id,
                clientId: session.user.id,
            },
            include: {
                service: true,
                review: true,
                assignment: {
                    include: {
                        worker: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        return NextResponse.json(booking)
    } catch (error) {
        console.error("Error fetching booking tracking:", error)
        return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
    }
}
