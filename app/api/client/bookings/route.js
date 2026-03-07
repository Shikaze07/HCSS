import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req) {
    try {
        const body = await req.json()
        const { clientId, serviceId, bookingDate, startTime, endTime, duration, address, latitude, longitude } = body

        if (!clientId || !serviceId || !bookingDate || !startTime || !endTime || !address) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Fetch service to get price
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        })

        if (!service) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            )
        }

        const booking = await prisma.booking.create({
            data: {
                clientId,
                serviceId,
                bookingDate: new Date(bookingDate),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                duration: parseInt(duration) || service.duration,
                address,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                totalAmount: service.price,
                status: "PENDING",
            },
        })

        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        console.error("Error creating booking:", error)
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        )
    }
}
