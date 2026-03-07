import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            user: {
                id: session.user.id,
                firstName: session.user.firstName,
                lastName: session.user.lastName,
                email: session.user.email,
                role: session.user.role,
            }
        });
    } catch (error) {
        console.error("Error fetching current user:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
