"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { TrackingDetail } from "../components/TrackingDetail"

export default function BookingTrackingPage() {
    const params = useParams()
    const router = useRouter()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/client/bookings/tracking/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setBooking(data)
            } else if (res.status === 404) {
                toast.error("Booking not found.")
                router.push("/client/service-tracking")
            } else {
                toast.error("Failed to load tracking information.")
            }
        } catch (error) {
            console.error("Error fetching booking:", error)
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBooking()
        const interval = setInterval(fetchBooking, 30000)
        return () => clearInterval(interval)
    }, [params.id])

    if (loading) {
        return (
            <div className="flex h-[600px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl border"
                    onClick={() => router.push("/client/service-tracking")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Booking Details</h1>
                    <p className="text-sm text-muted-foreground">Real-time status for your service request.</p>
                </div>
            </div>

            <TrackingDetail booking={booking} />

            <style jsx global>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
