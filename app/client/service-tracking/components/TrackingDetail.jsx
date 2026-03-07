"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, Clock, MapPin, Loader2 } from "lucide-react"
import { StatusTimeline } from "./StatusTimeline"

export function TrackingDetail({ booking }) {
    if (!booking) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-muted bg-muted/5">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">Select a booking to track its status</p>
            </div>
        )
    }

    const getStatusIndex = (booking) => {
        const assignmentStatus = booking.assignment?.status
        const bookingStatus = booking.status

        if (bookingStatus === "COMPLETED") return 5
        if (bookingStatus === "IN_PROGRESS") return 4

        switch (assignmentStatus) {
            case "ARRIVED": return 3
            case "ON_THE_WAY": return 2
            case "ASSIGNED":
            case "ACCEPTED": return 1
            default: return 0
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case "PENDING": return "Pending Confirmation"
            case "CONFIRMED": return "Booking Confirmed"
            case "IN_PROGRESS": return "Ongoing Service"
            case "COMPLETED": return "Service Finished"
            case "CANCELLED": return "Booking Cancelled"
            default: return status
        }
    }

    const currentStepIndex = getStatusIndex(booking)

    return (
        <Card id="tracking-detail" className="border-none shadow-xl bg-gradient-to-br from-card to-muted/20 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-3xl font-black text-primary">
                            {booking.service?.name}
                        </CardTitle>
                        <CardDescription className="text-base font-medium mt-1">
                            Booking ID: <span className="text-foreground font-mono">{booking.id.slice(0, 8)}</span>
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1">
                        <div className="text-2xl font-black text-foreground">₱{booking.totalAmount?.toLocaleString()}</div>
                        <Badge variant="secondary" className="font-bold uppercase tracking-wider text-[10px] py-0.5 px-2 bg-primary/10 text-primary border-primary/20">
                            {getStatusLabel(booking.status)}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8 space-y-12">
                <StatusTimeline currentStepIndex={currentStepIndex} />

                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t">
                    {/* Worker Info */}
                    <div className="space-y-5 p-6 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10"><User className="h-5 w-5 text-primary" /></div>
                            Assigned Worker
                        </h3>
                        {booking.assignment ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/20 shadow-inner">
                                        {booking.assignment.worker.firstName[0]}{booking.assignment.worker.lastName[0]}
                                    </div>
                                    <div>
                                        <div className="font-black text-xl">{booking.assignment.worker.firstName} {booking.assignment.worker.lastName}</div>
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 font-bold uppercase tracking-wider text-[10px]">Active Now</Badge>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-default">
                                        <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center border shadow-sm"><Phone className="h-4 w-4" /></div>
                                        {booking.assignment.worker.phone || "No phone provided"}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-default">
                                        <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center border shadow-sm"><Mail className="h-4 w-4" /></div>
                                        {booking.assignment.worker.email}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                                <Loader2 className="h-10 w-10 text-muted-foreground/30 animate-spin" />
                                <p className="text-sm font-bold text-muted-foreground">Finding the best worker for you...</p>
                            </div>
                        )}
                    </div>

                    {/* Service Details */}
                    <div className="space-y-5 p-6 rounded-2xl bg-card border shadow-sm">
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10"><Clock className="h-5 w-5 text-primary" /></div>
                            Service Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Start Time</span>
                                <div className="font-bold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Duration</span>
                                <div className="font-bold flex items-center gap-2">
                                    <div className="h-4 w-4 text-primary flex items-center justify-center rounded-full border border-primary text-[8px]">M</div>
                                    {booking.duration} mins
                                </div>
                            </div>
                            <div className="col-span-2 space-y-1 mt-2">
                                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Address</span>
                                <div className="font-bold flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm line-clamp-2">{booking.address}</span>
                                </div>
                            </div>
                            {booking.service?.description && (
                                <div className="col-span-2 space-y-1 mt-2 pt-3 border-t border-dashed">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Description</span>
                                    <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic">
                                        "{booking.service.description}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
