import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(req, { params }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { firstName, middleName, lastName, email, phone, role, status, password } = body

        const updateData = {
            firstName,
            middleName,
            lastName,
            email,
            phone,
            role,
            status,
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10)
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        )
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params
        await prisma.user.delete({
            where: { id },
        })
        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Error deleting user:", error)
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        )
    }
}
