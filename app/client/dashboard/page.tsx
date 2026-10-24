"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    ArrowRight,
    Plus,
    User,
    ShieldCheck,
    Loader2,
    CalendarCheck,
    Receipt,
    Star,
    Home
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ClientDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/client/dashboard");
            if (res.ok) {
                const result = await res.json();
                setData(result);
            } else {
                toast.error("Failed to load client dashboard");
            }
        } catch (error) {
            console.error("Error loading client dashboard:", error);
            toast.error("Failed to fetch dashboard information");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[500px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const nextBooking = data?.nextBooking;
    const stats = data?.stats || {};
    const recentBookings = data?.recentBookings || [];
    const featuredServices = data?.featuredServices || [];
    const clientName = data?.clientName || "Valued Client";

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
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-background border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        <Home className="w-3.5 h-3.5" />
                        HCSS Home Care Experience
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                        Welcome back, {clientName}!
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Keep your home fresh, sanitized, and relaxing. Manage your ongoing cleanings or book a professional cleaner in seconds.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        size="lg"
                        onClick={() => (window.location.href = "/client/booking-management")}
                        className="gap-2 font-bold shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Book a Cleaning
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => (window.location.href = "/client/service-history")}
                        className="gap-2"
                    >
                        <Receipt className="w-4 h-4" />
                        Past Services
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Cleanings Completed
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.completedCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Homes cleaned to perfection
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Bookings
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalBookings || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Overall service reservations
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Home Care Spend
                        </CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-base">
                            ₱
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">₱{(stats.totalSpent || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Settled invoices
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Next Scheduled Cleaning Spotlight */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold tracking-tight">Active Cleaning Spotlight</h2>
                {nextBooking ? (
                    <Card className="border border-primary/40 bg-card shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-extrabold text-foreground">
                                        {nextBooking.service?.name}
                                    </h3>
                                    {getStatusBadge(nextBooking.status)}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                                        <span>
                                            {new Date(nextBooking.bookingDate).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary shrink-0" />
                                        <span>
                                            {new Date(nextBooking.startTime).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })} ({nextBooking.duration} mins)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary shrink-0" />
                                        <span>
                                            Cleaner: {nextBooking.assignment?.worker
                                                ? `${nextBooking.assignment.worker.firstName} ${nextBooking.assignment.worker.lastName}`
                                                : "Assigning specialist..."}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span>{nextBooking.address}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0">
                                <Button
                                    onClick={() => (window.location.href = "/client/service-tracking")}
                                    className="gap-2 w-full sm:w-auto"
                                >
                                    <Clock className="w-4 h-4" />
                                    Track Live Progress
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="border border-dashed p-8 text-center flex flex-col items-center justify-center">
                        <ShieldCheck className="w-10 h-10 text-primary/40 mb-2" />
                        <h3 className="text-base font-bold">No active cleanings scheduled right now</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                            Book your next appointment in advance to secure your preferred cleaner and time slot.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => (window.location.href = "/client/booking-management")}
                        >
                            Schedule a Cleaning Now
                        </Button>
                    </Card>
                )}
            </div>

            {/* Popular Cleaning Packages */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Available Cleaning Packages</h2>
                        <p className="text-xs text-muted-foreground">Tailored professional services for every need</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => (window.location.href = "/client/booking-management")}
                        className="text-primary text-xs font-bold gap-1"
                    >
                        Browse All Services
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredServices.map((service: any) => (
                        <Card
                            key={service.id}
                            className="border hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">{service.name}</CardTitle>
                                <CardDescription className="text-xs line-clamp-2 mt-1">
                                    {service.description || "Professional cleaning service."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <div className="flex items-baseline justify-between pt-2 border-t">
                                    <span className="text-lg font-black text-foreground">
                                        ₱{service.price?.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {service.duration} mins
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => (window.location.href = "/client/booking-management")}
                                    className="w-full text-xs"
                                >
                                    Book This Service
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
