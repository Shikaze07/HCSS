import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// const PROTECTED_ROUTES = ["/admin", "/client", "/worker", "/dashboard"];

const PROTECTED_ROUTES = ["/client", "/worker", "/dashboard"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !sessionId) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && sessionId) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
