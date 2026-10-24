"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    Briefcase,
    Star,
    Phone,
    ArrowRight,
    Loader2,
    CalendarDays,
    Play,
    AlertCircle,
    UserCheck,
    Truck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WorkerDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/worker/dashboard");
            if (res.ok) {
                const result = await res.json();
                setData(result);
            } else {
                toast.error("Failed to load worker dashboard");
            }
        } catch (error) {
            console.error("Error loading worker dashboard:", error);
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

    const workerName = data?.workerName || "Cleaner";
    const currentTask = data?.currentTask;
    const stats = data?.stats || {};
    const todayTasks = data?.todayTasks || [];
    const recentReviews = data?.recentReviews || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <Badge className="bg-emerald-500/15 text-emerald-700">Completed</Badge>;
            case "IN_PROGRESS":
                return <Badge className="bg-blue-500/15 text-blue-700 animate-pulse">In Progress</Badge>;
            case "ON_THE_WAY":
                return <Badge className="bg-amber-500/15 text-amber-700">On The Way</Badge>;
            case "ARRIVED":
                return <Badge className="bg-purple-500/15 text-purple-700">Arrived</Badge>;
            case "ACCEPTED":
                return <Badge className="bg-indigo-500/15 text-indigo-700">Accepted</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const b = currentTask?.booking;

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header / Duty Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        Cleaner Shift Hub
                        <Badge variant="outline" className="text-xs font-semibold">
                            On Duty
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                        Welcome, {workerName}! Manage your active cleaning orders, daily schedule, and client ratings.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = "/worker/schedule-management")}
                        className="gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        My Schedule
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => (window.location.href = "/worker/task-status")}
                        className="gap-2 font-bold"
                    >
                        <Play className="w-4 h-4" />
                        Active Task
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Today's Cleaning Jobs
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.todayCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Scheduled for today
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Upcoming Queue
                        </CardTitle>
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.upcomingCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Jobs in progress or confirmed
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Jobs Completed
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.completedCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Successfully delivered cleanings
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            My Rating Score
                        </CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                            <Star className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black flex items-center gap-1.5">
                            {stats.avgRating}
                            <span className="text-sm font-normal text-muted-foreground">/ 5.0</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            From {stats.reviewCount || 0} client reviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Current Active Task Hero Banner */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold tracking-tight">Current Operational Task</h2>
                {currentTask && b ? (
                    <Card className="border border-primary/50 shadow-md bg-linear-to-r from-card via-card to-primary/5 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl md:text-2xl font-black text-foreground">
                                        {b.service?.name}
                                    </h3>
                                    {getStatusBadge(currentTask.status)}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                                        <span>
                                            {new Date(b.bookingDate).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary shrink-0" />
                                        <span>
                                            {new Date(b.startTime).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })} ({b.duration} mins)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-foreground font-medium">
                                        <UserCheck className="w-4 h-4 text-primary shrink-0" />
                                        <span>Client: {b.client?.firstName} {b.client?.lastName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span>{b.address}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0">
                                {b.client?.phone && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="w-full sm:w-auto gap-1.5"
                                    >
                                        <a href={`tel:${b.client.phone}`}>
                                            <Phone className="w-4 h-4 text-primary" />
                                            Call Client
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    onClick={() => (window.location.href = "/worker/task-status")}
                                    className="gap-2 w-full sm:w-auto font-bold"
                                >
                                    <Play className="w-4 h-4" />
                                    Update Task Status
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="border border-dashed p-8 text-center flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-2" />
                        <h3 className="text-base font-bold">No tasks currently in progress</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                            You're caught up! Check your schedule to review upcoming cleaning appointments.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => (window.location.href = "/worker/schedule-management")}
                        >
                            Open Schedule Management
                        </Button>
                    </Card>
                )}
            </div>

            {/* Split Content: Today's Tasks & Recent Customer Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Agenda */}
                <Card className="border lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Today's Cleaning Shift</CardTitle>
                            <CardDescription>
                                Tasks scheduled for execution today.
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => (window.location.href = "/worker/schedule-management")}
                            className="text-xs font-bold gap-1 text-primary"
                        >
                            View Full Schedule
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {todayTasks.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                No cleaning jobs scheduled for today.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todayTasks.map((t: any) => {
                                    const taskBooking = t.booking;
                                    const startTime = new Date(taskBooking.startTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });

                                    return (
                                        <div
                                            key={t.id}
                                            className="p-3.5 rounded-xl border bg-card/60 flex items-center justify-between gap-4 text-xs"
                                        >
                                            <div className="space-y-1">
                                                <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                                    {taskBooking.service?.name}
                                                    {getStatusBadge(t.status)}
                                                </div>
                                                <div className="text-muted-foreground flex items-center gap-2">
                                                    <span>{startTime}</span>
                                                    <span>•</span>
                                                    <span>{taskBooking.address}</span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => (window.location.href = "/worker/task-status")}
                                                className="shrink-0 text-xs"
                                            >
                                                Details
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Client Reviews */}
                <Card className="border lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Client Reviews</CardTitle>
                        <CardDescription>
                            Ratings and compliments from homeowners.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentReviews.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-xs">
                                No ratings received yet. Deliver exceptional cleanings to earn 5-star ratings!
                            </div>
                        ) : (
                            recentReviews.map((r: any) => (
                                <div key={r.id} className="p-3 rounded-xl border bg-card/60 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold">{r.client?.firstName}</span>
                                        <div className="flex items-center gap-0.5 text-amber-500">
                                            {[...Array(r.rating)].map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-amber-500" />
                                            ))}
                                        </div>
                                    </div>
                                    {r.comment && (
                                        <p className="text-muted-foreground italic text-[11px]">
                                            "{r.comment}"
                                        </p>
                                    )}
                                    <div className="text-[10px] text-muted-foreground">
                                        {r.booking?.service?.name}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
