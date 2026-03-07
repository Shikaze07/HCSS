"use client";

import { useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    Info,
    ShieldCheck,
    Navigation,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export function JobAssignmentCard({ assignment, onStatusUpdate }) {
    const [updating, setUpdating] = useState(false);
    const { booking, status } = assignment;
    const { service, client, bookingDate, startTime, endTime, address } = booking;

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/worker/assignments/${assignment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Job ${newStatus.toLowerCase()} successfully.`);
                onStatusUpdate();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to update status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setUpdating(false);
        }
    };

    const statusColors = {
        ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
        ACCEPTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
        DECLINED: "bg-rose-100 text-rose-800 border-rose-200",
        ON_THE_WAY: "bg-amber-100 text-amber-800 border-amber-200",
        ARRIVED: "bg-indigo-100 text-indigo-800 border-indigo-200",
        IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
        COMPLETED: "bg-slate-100 text-slate-800 border-slate-200",
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(timeString).toLocaleTimeString("en-US", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className="overflow-hidden border-2 transition-all hover:shadow-lg hover:border-primary/20 bg-card">
            <div className={`h-2 ${statusColors[status] || "bg-gray-200"}`} />
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            {service.name}
                            <Badge variant="outline" className={`${statusColors[status]} font-semibold text-[10px] px-2 py-0`}>
                                {status}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                            <Info className="w-3.5 h-3.5" />
                            {service.description || "General cleaning service"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
                {/* Schedule Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-background rounded-md border shadow-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm">
                            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Date</p>
                            <p className="font-semibold text-foreground">{formatDate(bookingDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-background rounded-md border shadow-sm">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm">
                            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Time</p>
                            <p className="font-semibold text-foreground">{formatTime(startTime)} - {formatTime(endTime)}</p>
                        </div>
                    </div>
                </div>

                {/* Location & Client Section */}
                <div className="space-y-3">
                    <div className="flex items-start gap-2.5 group">
                        <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20 shrink-0">
                            <MapPin className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                        </div>
                        <div className="text-sm flex-1">
                            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Service Location</p>
                            <p className="font-medium text-foreground leading-relaxed">
                                {address}
                            </p>
                            <Button variant="link" className="p-0 h-auto text-xs text-primary font-semibold flex items-center gap-1 mt-0.5 hover:no-underline">
                                <Navigation className="w-3 h-3" />
                                Get Directions
                            </Button>
                        </div>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="p-1.5 bg-white rounded-full border border-primary/20 shadow-sm">
                                <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <p className="text-sm font-bold">{client.firstName} {client.lastName}</p>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{client.phone || "No phone provided"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors overflow-hidden">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{client.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-4 flex gap-2">
                {status === "ASSIGNED" && (
                    <>
                        <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                            disabled={updating}
                            onClick={() => handleUpdateStatus("ACCEPTED")}
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Accept Job
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                            disabled={updating}
                            onClick={() => handleUpdateStatus("DECLINED")}
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Decline
                        </Button>
                    </>
                )}
                {status === "ACCEPTED" && (
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                        disabled={updating}
                        onClick={() => handleUpdateStatus("ON_THE_WAY")}
                    >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Navigation className="w-4 h-4 mr-2" />}
                        On the Way
                    </Button>
                )}
                {status === "ON_THE_WAY" && (
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                        disabled={updating}
                        onClick={() => handleUpdateStatus("ARRIVED")}
                    >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
                        Arrived at Location
                    </Button>
                )}
                {status === "ARRIVED" && (
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                        disabled={updating}
                        onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Loader2 className="w-4 h-4 mr-2" />}
                        Start Cleaning
                    </Button>
                )}
                {status === "IN_PROGRESS" && (
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                        disabled={updating}
                        onClick={() => handleUpdateStatus("COMPLETED")}
                    >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Mark as Completed
                    </Button>
                )}
                {status === "COMPLETED" && (
                    <div className="w-full flex items-center justify-center py-2 text-emerald-600 font-bold bg-emerald-50 rounded-lg border border-emerald-100">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Job Completed
                    </div>
                )}
                {status === "DECLINED" && (
                    <div className="w-full flex items-center justify-center py-2 text-rose-600 font-bold bg-rose-50 rounded-lg border border-rose-100">
                        <XCircle className="w-4 h-4 mr-2" />
                        Job Declined
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
