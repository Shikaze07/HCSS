"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    User,
    CheckCircle2,
    XCircle,
    Calendar,
    Search,
    Filter,
    Loader2,
    AlertCircle,
    MoreVertical,
    Edit3,
    Check,
    CreditCard
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminBookingManagementPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
    const [newDate, setNewDate] = useState("");
    const [newStartTime, setNewStartTime] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/bookings?all=true");
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            } else {
                toast.error("Failed to load bookings");
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load booking management data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            setProcessingId(id);
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            if (!res.ok) {
                toast.error("Failed to update booking status");
                return;
            }

            toast.success(`Booking status changed to ${status}!`);
            fetchBookings();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rescheduleBooking || !newDate || !newStartTime) {
            toast.error("Please provide both a new date and start time");
            return;
        }

        try {
            setProcessingId(rescheduleBooking.id);
            const combinedStart = new Date(`${newDate}T${newStartTime}`);
            const durationMs = (rescheduleBooking.duration || 60) * 60 * 1000;
            const combinedEnd = new Date(combinedStart.getTime() + durationMs);

            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: rescheduleBooking.id,
                    bookingDate: combinedStart.toISOString(),
                    startTime: combinedStart.toISOString(),
                    endTime: combinedEnd.toISOString(),
                }),
            });

            if (!res.ok) {
                toast.error("Failed to reschedule booking");
                return;
            }

            toast.success("Booking rescheduled successfully!");
            setRescheduleBooking(null);
            fetchBookings();
        } catch (error) {
            console.error("Error rescheduling booking:", error);
            toast.error("Failed to reschedule");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredBookings = bookings.filter((b) => {
        const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            b.service?.name?.toLowerCase().includes(searchLower) ||
            b.address?.toLowerCase().includes(searchLower) ||
            `${b.client?.firstName} ${b.client?.lastName}`.toLowerCase().includes(searchLower);

        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <Badge className="bg-emerald-500/15 text-emerald-700">Completed</Badge>;
            case "IN_PROGRESS":
                return <Badge className="bg-blue-500/15 text-blue-700 animate-pulse">In Progress</Badge>;
            case "CONFIRMED":
                return <Badge className="bg-indigo-500/15 text-indigo-700">Confirmed</Badge>;
            case "PENDING":
                return <Badge variant="outline" className="text-amber-600 border-amber-500/40">Pending</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[500px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        Booking Management
                        <Badge variant="secondary" className="text-sm font-medium">
                            {bookings.length} Total
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                        Monitor all service bookings, approve appointments, reschedule, or cancel bookings when necessary.
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by client, service, or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className="text-xs capitalize font-medium rounded-lg whitespace-nowrap"
                        >
                            {status === "ALL" ? "All Bookings" : status.replace("_", " ").toLowerCase()}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Bookings Table / List */}
            <Card className="border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b">
                            <tr>
                                <th className="py-3 px-4">Booking Details</th>
                                <th className="py-3 px-4">Client</th>
                                <th className="py-3 px-4">Date & Time</th>
                                <th className="py-3 px-4">Assigned Cleaner</th>
                                <th className="py-3 px-4">Total Amount</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                        No bookings matching the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => {
                                    const dateFormatted = new Date(b.bookingDate).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    });
                                    const startTime = new Date(b.startTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });
                                    const isProcessing = processingId === b.id;

                                    return (
                                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold text-foreground">
                                                <div>{b.service?.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                                    {b.address}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-medium text-foreground">
                                                    {b.client?.firstName} {b.client?.lastName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {b.client?.phone || b.client?.email}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs">
                                                <div className="font-semibold text-foreground">{dateFormatted}</div>
                                                <div className="text-muted-foreground">{startTime} ({b.duration} mins)</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs">
                                                {b.assignment?.worker ? (
                                                    <span className="font-medium text-foreground">
                                                        {b.assignment.worker.firstName} {b.assignment.worker.lastName}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 font-medium">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-black text-foreground">
                                                ₱{b.totalAmount?.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {getStatusBadge(b.status)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {b.status === "PENDING" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isProcessing}
                                                            onClick={() => handleUpdateStatus(b.id, "CONFIRMED")}
                                                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 border-emerald-500/30"
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-1" />
                                                            Approve
                                                        </Button>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={isProcessing}
                                                        onClick={() => {
                                                            setRescheduleBooking(b);
                                                            const d = new Date(b.bookingDate);
                                                            setNewDate(d.toISOString().split("T")[0]);
                                                            setNewStartTime(new Date(b.startTime).toTimeString().slice(0, 5));
                                                        }}
                                                        className="text-xs font-medium"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5 mr-1" />
                                                        Reschedule
                                                    </Button>

                                                    {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            disabled={isProcessing}
                                                            onClick={() => handleUpdateStatus(b.id, "CANCELLED")}
                                                            className="text-xs"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Reschedule Modal */}
            <Dialog open={!!rescheduleBooking} onOpenChange={(open) => !open && setRescheduleBooking(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Calendar className="w-5 h-5 text-primary" />
                            Reschedule Booking
                        </DialogTitle>
                        <DialogDescription>
                            Adjust the service date and start time for {rescheduleBooking?.client?.firstName}'s {rescheduleBooking?.service?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReschedule} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">New Service Date</label>
                            <Input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">New Start Time</label>
                            <Input
                                type="time"
                                value={newStartTime}
                                onChange={(e) => setNewStartTime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                            Estimated duration: {rescheduleBooking?.duration} minutes. End time will be automatically adjusted.
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRescheduleBooking(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processingId === rescheduleBooking?.id}>
                                Confirm Reschedule
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
