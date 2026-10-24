// Shared Leaflet helpers. Leaflet touches `window`, so only import it inside effects.

export const DEFAULT_CENTER = [14.5995, 120.9842] // Manila

const pinSvg = (color) => `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
  <circle cx="16" cy="16" r="6" fill="#ffffff"/>
</svg>`

export function pinIcon(L, color = "#dc2626") {
    return L.divIcon({
        className: "",
        html: pinSvg(color),
        iconSize: [32, 42],
        iconAnchor: [16, 42],
    })
}

export function dotIcon(L, color = "#2563eb") {
    return L.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 0 0 2px ${color}55"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    })
}

export function addTiles(L, map) {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)
}
