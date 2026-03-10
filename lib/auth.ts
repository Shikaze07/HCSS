import { cookies } from "next/headers";
import prisma from "./prisma";
// We can import types directly from the generated client if needed, 
// but for simplicity we'll use 'any' if types are tricky to find, 
// or try to find them in the right place.
import type { Session, User } from "../generated/prisma/client";

const SESSION_COOKIE_NAME = "session_id";
const ROLE_COOKIE_NAME = "user_role";

export async function createSession(userId: string, role: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await prisma.session.create({
        data: {
            userId,
            expiresAt,
        },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    });

    cookieStore.set(ROLE_COOKIE_NAME, role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    });

    return session;
}

export async function deleteSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Always delete cookies first
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(ROLE_COOKIE_NAME);

    if (sessionId) {
        await prisma.session.delete({
            where: { id: sessionId },
        }).catch(() => {
            // Ignore if session not found in DB
        });
    }
}

export async function getSession(): Promise<(Session & { user: User }) | null> {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) return null;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
        if (session) {
            await prisma.session.delete({ where: { id: sessionId } }).catch(() => { });
        }
        return null;
    }

    return session;
}

export async function verifySession() {
    const session = await getSession();
    if (!session) return null;
    return session;
}
