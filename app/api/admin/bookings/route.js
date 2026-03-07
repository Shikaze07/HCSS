import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        // Fetch bookings that don't have an assignment yet
        const bookings = await prisma.booking.findMany({
            where: {
                assignment: null
            },
            include: {
                client: true,
                service: true,
            },
            orderBy: {
                bookingDate: "desc",
            },
        })
        return NextResponse.json(bookings)
    } catch (error) {
        console.error("Error fetching unassigned bookings:", error)
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        )
    }
}
