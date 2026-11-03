"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 5

export function BookingList({ bookings, selectedBooking }) {
    const [page, setPage] = useState(1)
    const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)
    const pagedBookings = bookings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    const getStatusLabel = (status) => {
        switch (status) {
            case "PENDING": return "Pending"
            case "CONFIRMED": return "Confirmed"
            case "IN_PROGRESS": return "Ongoing"
            case "COMPLETED": return "Finished"
            case "CANCELLED": return "Cancelled"
            default: return status
        }
    }

    return (
        <div className="space-y-5">
        <div className="space-y-5 pr-2">
            {pagedBookings.map((booking) => (
                <Link key={booking.id} href={`/client/service-tracking/${booking.id}`}>
                    <Card
                        className={cn(
                            "cursor-pointer transition-all duration-300 hover:shadow-md border-2 mb-5",
                            selectedBooking?.id === booking.id ? "border-primary bg-primary/5 shadow-sm" : "border-2 hover:border-primary/30"
                        )}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <Badge className={cn(
                                    "font-bold uppercase tracking-tighter text-[10px] py-0",
                                    booking.status === "COMPLETED" ? "bg-green-500/10 text-green-600 border-green-200" :
                                        booking.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600 border-yellow-200" :
                                            booking.status === "CANCELLED" ? "bg-red-500/10 text-red-600 border-red-200" :
                                                "bg-blue-500/10 text-blue-600 border-blue-200"
                                )} variant="outline">
                                    {getStatusLabel(booking.status)}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {new Date(booking.bookingDate).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg">{booking.service?.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" /> {booking.address}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-primary group">
                                <span className="group-hover:underline">View Details</span>
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
        {bookings.length > PAGE_SIZE && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                    Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                    Next
                </Button>
            </div>
        )}
        </div>
    )
}
