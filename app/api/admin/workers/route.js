import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { annotateWorkersForBooking } from "@/lib/worker-availability"

export async function GET(req) {
    try {
        const session = await getSession()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const workers = await prisma.user.findMany({
            where: {
                role: "WORKER",
                status: "ACTIVE",
            },
            orderBy: {
                lastName: "asc",
            },
        })

        // With ?bookingId=, mark which workers can take that booking based on their schedule
        const bookingId = new URL(req.url).searchParams.get("bookingId")
        if (bookingId) {
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                select: { id: true, startTime: true, endTime: true },
            })
            if (booking) {
                return NextResponse.json(await annotateWorkersForBooking(workers, booking))
            }
        }

        return NextResponse.json(workers)
    } catch (error) {
        console.error("Error fetching workers:", error)
        return NextResponse.json(
            { error: "Failed to fetch workers" },
            { status: 500 }
        )
    }
}
