import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const PROFILES = ["driving-car", "cycling-regular", "foot-walking"];

// Proxies OpenRouteService so the API key stays on the server.
export async function POST(req: Request) {
    try {
        const session = await getSession();

        if (!session || session.user.role !== "WORKER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.ORS_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Directions are not configured" }, { status: 500 });
        }

        const { start, end, profile = "driving-car" } = await req.json();
        const isPoint = (p: unknown) =>
            Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === "number" && Number.isFinite(n));

        if (!isPoint(start) || !isPoint(end) || !PROFILES.includes(profile)) {
            return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
        }

        const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
            method: "POST",
            headers: {
                Authorization: apiKey,
                "Content-Type": "application/json",
                Accept: "application/geo+json",
            },
            // ORS expects [longitude, latitude]
            body: JSON.stringify({ coordinates: [start, end], language: "en" }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("ORS directions error:", data);
            return NextResponse.json(
                { error: data?.error?.message || "Could not find a route" },
                { status: res.status === 404 ? 404 : 502 }
            );
        }

        const feature = data.features?.[0];
        const segment = feature?.properties?.segments?.[0];

        return NextResponse.json({
            coordinates: feature?.geometry?.coordinates ?? [],
            distance: feature?.properties?.summary?.distance ?? 0,
            duration: feature?.properties?.summary?.duration ?? 0,
            steps: (segment?.steps ?? []).map((s: { instruction: string; distance: number; duration: number }) => ({
                instruction: s.instruction,
                distance: s.distance,
                duration: s.duration,
            })),
        });
    } catch (error) {
        console.error("Error fetching directions:", error);
        return NextResponse.json({ error: "Failed to fetch directions" }, { status: 500 });
    }
}
