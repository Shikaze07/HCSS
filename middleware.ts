import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const PROTECTED_ROUTES = ["/admin", "/client", "/worker", "/dashboard"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    const userRole = cookieStore.get("user_role")?.value;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    let response: NextResponse;

    if (isProtectedRoute && !sessionId) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        response = NextResponse.redirect(loginUrl);
    } else if (isAuthRoute && sessionId) {
        // Redirect to appropriate dashboard based on role
        if (userRole) {
            let dashboardPath = "/dashboard";
            if (userRole === "ADMIN") dashboardPath = "/admin/dashboard";
            else if (userRole === "CLIENT") dashboardPath = "/client/booking-management";
            else if (userRole === "WORKER") dashboardPath = "/worker/job-assignment";

            if (pathname !== dashboardPath) {
                response = NextResponse.redirect(new URL(dashboardPath, request.url));
            } else {
                response = NextResponse.next();
            }
        } else {
            response = NextResponse.redirect(new URL("/dashboard", request.url));
        }
    } else if (isProtectedRoute && sessionId) {
        // Enforce RBAC ONLY if we have the role cookie.
        // If missing, let the server-side page handle it (avoids loops with old sessions).
        if (userRole) {
            let isAuthorized = true;
            if (pathname.startsWith("/admin") && userRole !== "ADMIN") isAuthorized = false;
            else if (pathname.startsWith("/client") && userRole !== "CLIENT") isAuthorized = false;
            else if (pathname.startsWith("/worker") && userRole !== "WORKER") isAuthorized = false;

            if (!isAuthorized) {
                let dashboardPath = "/dashboard";
                if (userRole === "ADMIN") dashboardPath = "/admin/dashboard";
                else if (userRole === "CLIENT") dashboardPath = "/client/booking-management";
                else if (userRole === "WORKER") dashboardPath = "/worker/job-assignment";

                if (pathname !== dashboardPath) {
                    response = NextResponse.redirect(new URL(dashboardPath, request.url));
                } else {
                    response = NextResponse.next();
                }
            } else {
                response = NextResponse.next();
            }
        } else {
            response = NextResponse.next();
        }
    } else {
        response = NextResponse.next();
    }

    // Prevent caching for protected routes to handle back button after logout
    if (isProtectedRoute) {
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
    }

    return response;
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
