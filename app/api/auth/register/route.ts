import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, middleName, lastName, email, password, phone } = body;

        // Validate required fields
        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
            return NextResponse.json(
                { error: "Please provide first name, last name, email, and password." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check password requirements
        const passwordRequirements = [
            /.{8,}/,            // 8+ characters
            /[A-Z]/,            // uppercase
            /[a-z]/,            // lowercase
            /[0-9]/,            // number
            /[^A-Za-z0-9]/,     // special character
        ];

        const isValidPassword = passwordRequirements.every((regex) => regex.test(password));
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character." },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "An account with this email already exists. Please log in instead." },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create client user strictly with role CLIENT
        const newUser = await prisma.user.create({
            data: {
                firstName: firstName.trim(),
                middleName: middleName?.trim() || null,
                lastName: lastName.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                phone: phone?.trim() || null,
                role: "CLIENT",
                status: "ACTIVE",
            },
        });

        // Automatically authenticate customer session
        await createSession(newUser.id, "CLIENT");

        return NextResponse.json(
            {
                success: true,
                message: "Customer account created successfully!",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Customer registration error:", error);
        return NextResponse.json(
            { error: "Failed to register customer account. Please try again later." },
            { status: 500 }
        );
    }
}
