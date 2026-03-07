import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })
        return NextResponse.json(services)
    } catch (error) {
        console.error("Error fetching services:", error)
        return NextResponse.json(
            { error: "Failed to fetch services" },
            { status: 500 }
        )
    }
}

export async function POST(req) {
    try {
        const body = await req.json()
        const { name, description, price, duration } = body

        if (!name || !price) {
            return NextResponse.json(
                { error: "Name and Price are required" },
                { status: 400 }
            )
        }

        const service = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                duration: parseInt(duration) || 60,
                status: true,
            },
        })

        return NextResponse.json(service)
    } catch (error) {
        console.error("Error creating service:", error)
        return NextResponse.json(
            { error: "Failed to create service" },
            { status: 500 }
        )
    }
}
