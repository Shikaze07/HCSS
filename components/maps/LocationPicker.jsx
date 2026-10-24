"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import { DEFAULT_CENTER, addTiles, pinIcon } from "./leaflet-utils"

// Click the map or drag the red pin to choose a location.
export function LocationPicker({ latitude, longitude, onChange, className = "h-64" }) {
    const containerRef = useRef(null)
    const mapRef = useRef(null)
    const markerRef = useRef(null)
    const LRef = useRef(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    useEffect(() => {
        let cancelled = false

        import("leaflet").then(({ default: L }) => {
            if (cancelled || !containerRef.current || mapRef.current) return
            LRef.current = L

            const hasPin = latitude != null && longitude != null
            const map = L.map(containerRef.current).setView(hasPin ? [latitude, longitude] : DEFAULT_CENTER, hasPin ? 17 : 12)
            addTiles(L, map)
            mapRef.current = map

            const placeMarker = (lat, lng) => {
                if (!markerRef.current) {
                    markerRef.current = L.marker([lat, lng], { icon: pinIcon(L), draggable: true }).addTo(map)
                    markerRef.current.on("dragend", (e) => {
                        const pos = e.target.getLatLng()
                        onChangeRef.current?.(pos.lat, pos.lng)
                    })
                } else {
                    markerRef.current.setLatLng([lat, lng])
                }
            }
            map._placeMarker = placeMarker

            if (hasPin) placeMarker(latitude, longitude)

            map.on("click", (e) => {
                placeMarker(e.latlng.lat, e.latlng.lng)
                onChangeRef.current?.(e.latlng.lat, e.latlng.lng)
            })

            // The map may mount inside an animating dialog; recalc size once it settles.
            setTimeout(() => map.invalidateSize(), 300)
        })

        return () => {
            cancelled = true
            mapRef.current?.remove()
            mapRef.current = null
            markerRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Keep the pin in sync when coordinates are set from outside (e.g. "Use my location").
    useEffect(() => {
        const map = mapRef.current
        if (!map || latitude == null || longitude == null) return
        const current = markerRef.current?.getLatLng()
        if (current && current.lat === latitude && current.lng === longitude) return
        map._placeMarker(latitude, longitude)
        map.setView([latitude, longitude], Math.max(map.getZoom(), 17))
    }, [latitude, longitude])

    return <div ref={containerRef} className={`relative z-0 w-full rounded-md border overflow-hidden ${className}`} />
}
