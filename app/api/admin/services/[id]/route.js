import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(req, { params }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { name, description, price, status, duration, image } = body

        const updatedService = await prisma.service.update({
            where: { id },
            data: {
                name,
                description,
                image,
                price: parseFloat(price),
                duration: parseInt(duration) || 60,
                status: status === "ACTIVE" || status === true,
            },
        })

        return NextResponse.json(updatedService)
    } catch (error) {
        console.error("Error updating service:", error)
        return NextResponse.json(
            { error: "Failed to update service" },
            { status: 500 }
        )
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params
        await prisma.service.delete({
            where: { id },
        })
        return NextResponse.json({ message: "Service deleted successfully" })
    } catch (error) {
        console.error("Error deleting service:", error)
        return NextResponse.json(
            { error: "Failed to delete service" },
            { status: 500 }
        )
    }
}
