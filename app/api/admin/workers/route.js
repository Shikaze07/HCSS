import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const workers = await prisma.user.findMany({
            where: {
                role: "WORKER",
                status: "ACTIVE",
            },
            orderBy: {
                lastName: "asc",
            },
        })
        return NextResponse.json(workers)
    } catch (error) {
        console.error("Error fetching workers:", error)
        return NextResponse.json(
            { error: "Failed to fetch workers" },
            { status: 500 }
        )
    }
}
