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

        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [router])

    return null
}
