import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })
        return NextResponse.json(users)
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { firstName, middleName, lastName, email, password, phone, role } = body

        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                firstName,
                middleName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                role,
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error("Error creating user:", error)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
}
