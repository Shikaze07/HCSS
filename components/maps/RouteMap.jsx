"use client"

import { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"
import { Loader2, Navigation, LocateFixed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addTiles, dotIcon, pinIcon } from "./leaflet-utils"

const formatDistance = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`)
const formatDuration = (s) => {
    const mins = Math.round(s / 60)
    if (mins < 60) return `${mins} min`
    return `${Math.floor(mins / 60)} hr ${mins % 60} min`
}

// Shows the client's location as a red pin, plus a route from the worker's current position.
// Pass showRoute={false} to show only the pin.
export function RouteMap({ latitude, longitude, address, showRoute = true }) {
    const containerRef = useRef(null)
    const mapRef = useRef(null)
    const layersRef = useRef({ route: null, origin: null })
    const LRef = useRef(null)

    const [origin, setOrigin] = useState(null)
    const [route, setRoute] = useState(null)
    const [status, setStatus] = useState("idle") // idle | locating | routing | done | error
    const [error, setError] = useState("")

    // Set up the map with the destination pin
    useEffect(() => {
        let cancelled = false
        import("leaflet").then(({ default: L }) => {
            if (cancelled || !containerRef.current || mapRef.current) return
            LRef.current = L
            const map = L.map(containerRef.current).setView([latitude, longitude], 16)
            addTiles(L, map)
            L.marker([latitude, longitude], { icon: pinIcon(L) })
                .addTo(map)
                .bindPopup(address || "Client location")
            mapRef.current = map
            setTimeout(() => map.invalidateSize(), 200)
        })
        return () => {
            cancelled = true
            mapRef.current?.remove()
            mapRef.current = null
            layersRef.current = { route: null, origin: null }
        }
    }, [latitude, longitude, address])

    const locateMe = () => {
        if (!navigator.geolocation) {
            setStatus("error")
            setError("Your browser does not support location.")
            return
        }
        setStatus("locating")
        setError("")
        navigator.geolocation.getCurrentPosition(
            (pos) => setOrigin([pos.coords.latitude, pos.coords.longitude]),
            () => {
                setStatus("error")
                setError("Allow location access to get directions.")
            },
            { enableHighAccuracy: true, timeout: 15000 }
        )
    }

    // Fetch and draw the route whenever the origin changes
    useEffect(() => {
        if (!origin) return
        let cancelled = false
        setStatus("routing")
        setError("")

        fetch("/api/worker/directions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                start: [origin[1], origin[0]],
                end: [longitude, latitude],
            }),
        })
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Could not get directions")
                return data
            })
            .then((data) => {
                if (cancelled) return
                const L = LRef.current
                const map = mapRef.current
                if (!L || !map) return

                layersRef.current.route?.remove()
                layersRef.current.origin?.remove()

                const line = data.coordinates.map(([lng, lat]) => [lat, lng])
                layersRef.current.route = L.polyline(line, { color: "#2563eb", weight: 5, opacity: 0.85 }).addTo(map)
                layersRef.current.origin = L.marker(origin, { icon: dotIcon(L) }).addTo(map).bindPopup("You are here")
                map.fitBounds(layersRef.current.route.getBounds(), { padding: [30, 30] })

                setRoute(data)
                setStatus("done")
            })
            .catch((err) => {
                if (cancelled) return
                setStatus("error")
                setError(err.message)
            })

        return () => {
            cancelled = true
        }
    }, [origin, latitude, longitude])

    const busy = status === "locating" || status === "routing"

    return (
        <div className="space-y-3">
            <div ref={containerRef} className="relative z-0 h-64 w-full rounded-lg border overflow-hidden" />

            {showRoute && <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" variant="secondary" className="h-8 gap-1 ml-auto" onClick={locateMe} disabled={busy}>
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                    {origin ? "Update my location" : "Show route from me"}
                </Button>
            </div>}

            {error && <p className="text-xs text-rose-600">{error}</p>}

            {route && status === "done" && (
                <div className="rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 px-3 py-2 border-b text-sm font-semibold">
                        <Navigation className="w-4 h-4 text-primary" />
                        {formatDistance(route.distance)} · {formatDuration(route.duration)}
                    </div>
                    <ol className="max-h-48 overflow-y-auto divide-y text-xs">
                        {route.steps.map((step, i) => (
                            <li key={i} className="flex justify-between gap-3 px-3 py-2">
                                <span>
                                    <span className="font-semibold text-muted-foreground mr-1.5">{i + 1}.</span>
                                    {step.instruction}
                                </span>
                                {step.distance > 0 && (
                                    <span className="shrink-0 text-muted-foreground">{formatDistance(step.distance)}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    )
}
