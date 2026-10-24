"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    User,
    CheckCircle2,
    AlertCircle,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Settings2,
    Loader2,
    CalendarCheck,
    Briefcase,
    Phone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
    { key: "MON", label: "Monday" },
    { key: "TUE", label: "Tuesday" },
    { key: "WED", label: "Wednesday" },
    { key: "THU", label: "Thursday" },
    { key: "FRI", label: "Friday" },
    { key: "SAT", label: "Saturday" },
    { key: "SUN", label: "Sunday" },
];

export default function WorkerSchedulePage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [availability, setAvailability] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
    const [savingAvailability, setSavingAvailability] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Working hours state for modal
    const [scheduleConfig, setScheduleConfig] = useState<Record<string, { enabled: boolean; start: number; end: number }>>({
        MON: { enabled: true, start: 8, end: 17 },
        TUE: { enabled: true, start: 8, end: 17 },
        WED: { enabled: true, start: 8, end: 17 },
        THU: { enabled: true, start: 8, end: 17 },
        FRI: { enabled: true, start: 8, end: 17 },
        SAT: { enabled: false, start: 9, end: 15 },
        SUN: { enabled: false, start: 9, end: 15 },
    });

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/worker/schedule");
            if (res.ok) {
                const data = await res.json();
                setAssignments(data.assignments || []);
                setAvailability(data.availability || []);

                if (data.availability && data.availability.length > 0) {
                    // Once saved, any day without a working window is a day off
                    const newConfig = Object.fromEntries(
                        Object.entries(scheduleConfig).map(([day, val]) => [day, { ...val, enabled: false }])
                    );
                    data.availability.forEach((avail: any) => {
                        const start = new Date(avail.startTime).getHours();
                        const end = new Date(avail.endTime).getHours();
                        if (newConfig[avail.day] && end > start) {
                            newConfig[avail.day] = { enabled: true, start, end };
                        }
                    });
                    setScheduleConfig(newConfig);
                }
            } else {
                toast.error("Failed to load schedule");
            }
        } catch (error) {
            console.error("Error loading schedule:", error);
            toast.error("An error occurred while loading schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const handleSaveAvailability = async () => {
        try {
            setSavingAvailability(true);
            const payload = Object.entries(scheduleConfig).map(([day, val]) => ({
                day,
                enabled: val.enabled,
                startHour: val.start,
                endHour: val.end,
            }));

            const res = await fetch("/api/worker/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schedules: payload }),
            });

            if (res.ok) {
                toast.success("Availability preferences saved!");
                setIsAvailabilityOpen(false);
                fetchSchedule();
            } else {
                toast.error("Failed to update availability");
            }
        } catch (error) {
            console.error("Error saving availability:", error);
            toast.error("Error saving schedule");
        } finally {
            setSavingAvailability(false);
        }
    };

    // Filter today's tasks
    const todayStr = new Date().toDateString();
    const todayAssignments = assignments.filter((a) => {
        return new Date(a.booking?.bookingDate).toDateString() === todayStr;
    });

    // Upcoming assignments (not completed, sorted by date)
    const upcomingAssignments = assignments.filter(
        (a) => a.status !== "COMPLETED" && a.status !== "DECLINED"
    );

    const completedAssignments = assignments.filter((a) => a.status === "COMPLETED");

    const workingDaysCount = availability.filter(
        (a) => new Date(a.endTime).getTime() > new Date(a.startTime).getTime()
    ).length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Completed</Badge>;
            case "IN_PROGRESS":
                return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 animate-pulse">In Progress</Badge>;
            case "ON_THE_WAY":
                return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">On The Way</Badge>;
            case "ARRIVED":
                return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400">Arrived</Badge>;
            case "ACCEPTED":
                return <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">Accepted</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        Schedule Management
                        <Badge variant="secondary" className="text-sm font-medium">
                            {upcomingAssignments.length} Active Tasks
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                        View your daily and weekly cleaning schedule, prevent conflicts, and manage work availability.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsAvailabilityOpen(true)}
                        className="gap-2"
                    >
                        <Settings2 className="w-4 h-4" />
                        Set Availability
                    </Button>
                    <Button
                        onClick={() => (window.location.href = "/worker/task-status")}
                        className="gap-2"
                    >
                        <Briefcase className="w-4 h-4" />
                        Go to Active Tasks
                    </Button>
                </div>
            </div>

            {/* Quick Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Today's Cleanings
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayAssignments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Scheduled for {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Upcoming Queue
                        </CardTitle>
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pending or confirmed ahead
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Completed Cleanings
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedAssignments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Successfully finished jobs
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Available Days
                        </CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {availability.length > 0 ? `${workingDaysCount} days/wk` : "Not Configured"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active working roster
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Schedule Views */}
            <Tabs defaultValue="upcoming" className="w-full space-y-6">
                <TabsList className="bg-muted p-1">
                    <TabsTrigger value="upcoming" className="gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        Upcoming Roster ({upcomingAssignments.length})
                    </TabsTrigger>
                    <TabsTrigger value="today" className="gap-2">
                        <Clock className="w-4 h-4" />
                        Today's Agenda ({todayAssignments.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        History ({completedAssignments.length})
                    </TabsTrigger>
                </TabsList>

                {/* Upcoming Tab */}
                <TabsContent value="upcoming" className="space-y-4">
                    {upcomingAssignments.length === 0 ? (
                        <Card className="p-12 text-center border-dashed">
                            <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">No upcoming assignments</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                You are all caught up! When administrator assigns you new cleaning jobs, they will appear here.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingAssignments.map((assignment) => {
                                const b = assignment.booking;
                                const dateFormatted = new Date(b.bookingDate).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });
                                const startTime = new Date(b.startTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });
                                const endTime = new Date(b.endTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                return (
                                    <Card
                                        key={assignment.id}
                                        className="border hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <CardTitle className="text-base font-bold">
                                                        {b.service?.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs mt-1">
                                                        Duration: {b.duration} mins
                                                    </CardDescription>
                                                </div>
                                                {getStatusBadge(assignment.status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-xs md:text-sm">
                                            <div className="flex items-center gap-2 text-foreground font-medium">
                                                <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                                                <span>{dateFormatted}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                                <span>
                                                    {startTime} - {endTime}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{b.address}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                                                <User className="w-4 h-4 text-primary shrink-0" />
                                                <span className="font-medium text-foreground">
                                                    Client: {b.client?.firstName} {b.client?.lastName}
                                                </span>
                                            </div>

                                            <Button
                                                className="w-full mt-2"
                                                size="sm"
                                                onClick={() => (window.location.href = "/worker/task-status")}
                                            >
                                                Manage Task Status
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Today's Agenda Tab */}
                <TabsContent value="today" className="space-y-4">
                    {todayAssignments.length === 0 ? (
                        <Card className="p-12 text-center border-dashed">
                            <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">No tasks scheduled for today</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Take a breather or check upcoming jobs in the upcoming tab.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {todayAssignments.map((assignment) => {
                                const b = assignment.booking;
                                const startTime = new Date(b.startTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });
                                const endTime = new Date(b.endTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                return (
                                    <Card key={assignment.id} className="p-6 border">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold">{b.service?.name}</h3>
                                                    {getStatusBadge(assignment.status)}
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 text-primary" />
                                                        {startTime} - {endTime} ({b.duration} mins)
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="w-4 h-4 text-primary" />
                                                        {b.client?.firstName} {b.client?.lastName}
                                                    </span>
                                                    {b.client?.phone && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Phone className="w-4 h-4 text-primary" />
                                                            {b.client.phone}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    {b.address}
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() => (window.location.href = "/worker/task-status")}
                                                className="shrink-0"
                                            >
                                                Update Status
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Completed Tab */}
                <TabsContent value="completed" className="space-y-4">
                    {completedAssignments.length === 0 ? (
                        <Card className="p-12 text-center border-dashed">
                            <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">No completed tasks yet</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Jobs you mark as "Completed" will be archived here.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {completedAssignments.map((assignment) => {
                                const b = assignment.booking;
                                const dateFormatted = new Date(b.bookingDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });

                                return (
                                    <div
                                        key={assignment.id}
                                        className="p-4 rounded-xl border bg-card flex items-center justify-between gap-4 text-sm"
                                    >
                                        <div className="space-y-1">
                                            <div className="font-semibold text-foreground flex items-center gap-2">
                                                {b.service?.name}
                                                <Badge className="bg-emerald-500/15 text-emerald-700 text-xs">
                                                    Completed
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {dateFormatted} • {b.address} • Client: {b.client?.firstName} {b.client?.lastName}
                                            </p>
                                        </div>
                                        <span className="font-bold text-muted-foreground text-xs">
                                            {b.duration} mins
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Set Availability Modal */}
            <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Settings2 className="w-5 h-5 text-primary" />
                            Manage Weekly Availability
                        </DialogTitle>
                        <DialogDescription>
                            Configure the days and hours you are available to accept cleaning jobs.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
                        {DAYS_OF_WEEK.map(({ key, label }) => {
                            const current = scheduleConfig[key] || { enabled: false, start: 8, end: 17 };

                            return (
                                <div
                                    key={key}
                                    className={`p-3 rounded-xl border transition-all ${
                                        current.enabled ? "bg-card border-primary/40 shadow-xs" : "bg-muted/30 border-muted"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`day-${key}`}
                                                checked={current.enabled}
                                                onChange={(e) =>
                                                    setScheduleConfig({
                                                        ...scheduleConfig,
                                                        [key]: { ...current, enabled: e.target.checked },
                                                    })
                                                }
                                                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <label
                                                htmlFor={`day-${key}`}
                                                className={`text-sm font-semibold cursor-pointer ${
                                                    current.enabled ? "text-foreground" : "text-muted-foreground"
                                                }`}
                                            >
                                                {label}
                                            </label>
                                        </div>

                                        {current.enabled ? (
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <select
                                                    value={current.start}
                                                    onChange={(e) =>
                                                        setScheduleConfig({
                                                            ...scheduleConfig,
                                                            [key]: { ...current, start: Number(e.target.value) },
                                                        })
                                                    }
                                                    className="border rounded px-1.5 py-1 bg-background text-xs"
                                                >
                                                    {[6, 7, 8, 9, 10, 11, 12].map((h) => (
                                                        <option key={h} value={h}>
                                                            {h}:00 AM
                                                        </option>
                                                    ))}
                                                </select>
                                                <span>to</span>
                                                <select
                                                    value={current.end}
                                                    onChange={(e) =>
                                                        setScheduleConfig({
                                                            ...scheduleConfig,
                                                            [key]: { ...current, end: Number(e.target.value) },
                                                        })
                                                    }
                                                    className="border rounded px-1.5 py-1 bg-background text-xs"
                                                >
                                                    {[14, 15, 16, 17, 18, 19, 20, 21].map((h) => (
                                                        <option key={h} value={h}>
                                                            {h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-medium">Off Duty</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAvailabilityOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveAvailability} disabled={savingAvailability} className="gap-2">
                            {savingAvailability && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Preferences
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
