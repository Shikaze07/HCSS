"use client"

import { useState, useEffect } from "react"
import { Calendar, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { BookingList } from "./components/BookingList"


export default function ServiceTrackingPage() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState(null)

    const fetchTrackingData = async () => {
        try {
            const res = await fetch("/api/client/bookings/tracking")
            const data = await res.json()
            if (res.ok) {
                setBookings(data)
                if (data.length > 0 && !selectedBooking) {
                    setSelectedBooking(data[0])
                }
            }
        } catch (error) {
            console.error("Error fetching tracking data:", error)
            toast.error("Failed to load tracking information")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTrackingData()
        const interval = setInterval(fetchTrackingData, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [])



    if (loading) {
        return (
            <div className="flex h-[600px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
                <div className="p-4 rounded-full bg-muted">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold">No active bookings found</h2>
                <p className="text-muted-foreground">You haven't booked any cleaning services yet.</p>
                <Button onClick={() => window.location.href = "/client/booking-management"}>
                    Book a Service
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Service Tracking</h1>
                <p className="text-muted-foreground text-base md:text-lg">
                    Monitor your ongoing and upcoming cleaning services in real-time.
                </p>
            </div>

            <div className="max-w-3xl mx-auto w-full">
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Your Bookings
                        <Badge variant="secondary" className="rounded-full">{bookings.length}</Badge>
                    </h2>
                    <BookingList
                        bookings={bookings}
                        selectedBooking={selectedBooking}
                    />
                </div>
            </div>

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
