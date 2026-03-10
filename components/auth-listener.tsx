"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AuthListener() {
    const router = useRouter()

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "logout-event") {
                router.refresh()
                window.location.href = "/login"
            }
        }

        // Handle bfcache (back-forward cache) restorations
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                // If page was restored from cache, refresh to trigger middleware check
                router.refresh()
            }
        }

        window.addEventListener("storage", handleStorageChange)
        window.addEventListener("pageshow", handlePageShow)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("pageshow", handlePageShow)
        }
    }, [router])

    return null
}
