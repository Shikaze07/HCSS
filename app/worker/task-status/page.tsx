"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    MapPin,
    User,
    CheckCircle2,
    Play,
    Truck,
    MapPinCheck,
    CheckSquare,
    Phone,
    Mail,
    AlertCircle,
    ChevronRight,
    Loader2,
    Calendar,
    Check,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const RouteMap = dynamic(
    () => import("@/components/maps/RouteMap").then((m) => m.RouteMap),
    { ssr: false, loading: () => <div className="h-64 w-full rounded-lg border bg-muted/40 animate-pulse" /> }
);

interface Client {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
}

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number;
}

interface Booking {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    duration: number;
    totalAmount: number;
    service: Service;
    client: Client;
}

interface Assignment {
    id: string;
    bookingId: string;
    workerId: string;
    status: "ASSIGNED" | "ACCEPTED" | "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "DECLINED";
    assignedAt: string;
    booking: Booking;
}

const STATUS_STEPS = [
    { key: "ACCEPTED", label: "Accepted", icon: CheckCircle2, description: "Job acknowledged" },
    { key: "ON_THE_WAY", label: "On The Way", icon: Truck, description: "Traveling to location" },
    { key: "ARRIVED", label: "Arrived", icon: MapPinCheck, description: "At client premises" },
    { key: "IN_PROGRESS", label: "In Progress", icon: Play, description: "Cleaning currently active" },
    { key: "COMPLETED", label: "Completed", icon: Check, description: "Service fulfilled" },
];

const DEFAULT_CHECKLIST = [
    { id: 1, text: "Initial walkthrough with client & area inspection", done: false },
    { id: 2, text: "Dust high surfaces, ceiling fans, and fixtures", done: false },
    { id: 3, text: "Vacuum carpets and mop hard floor surfaces", done: false },
    { id: 4, text: "Deep disinfect bathrooms, mirrors, and tiles", done: false },
    { id: 5, text: "Sanitize kitchen counters, sink, and appliances", done: false },
    { id: 6, text: "Empty all trash bins and replace liners", done: false },
    { id: 7, text: "Final quality inspection & client sign-off", done: false },
];

export default function TaskStatusPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
    const [secondsElapsed, setSecondsElapsed] = useState(0);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/worker/assignments");
            if (res.ok) {
                const data: Assignment[] = await res.json();
                setAssignments(data);

                // Auto-select in-progress task or first active task
                const active = data.find((a) => a.status === "IN_PROGRESS") ||
                    data.find((a) => ["ON_THE_WAY", "ARRIVED", "ACCEPTED", "ASSIGNED"].includes(a.status)) ||
                    data[0];

                if (active) {
                    setSelectedAssignment(active);
                }
            } else {
                toast.error("Failed to load task assignments");
            }
        } catch (error) {
            console.error("Error loading assignments:", error);
            toast.error("Failed to fetch task information");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    // Live timer when IN_PROGRESS
    useEffect(() => {
        let interval: any = null;
        if (selectedAssignment?.status === "IN_PROGRESS") {
            interval = setInterval(() => {
                setSecondsElapsed((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedAssignment?.status]);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedAssignment) return;

        try {
            setUpdating(true);
            const res = await fetch(`/api/worker/assignments/${selectedAssignment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Failed to update status");
                return;
            }

            const updated = await res.json();
            toast.success(`Task marked as ${newStatus.replace("_", " ")}!`);

            // Update in list and selected
            setAssignments((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item))
            );
            setSelectedAssignment(updated);

            if (newStatus === "COMPLETED") {
                toast.success("Great job! Cleaning assignment completed successfully!");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating task status");
        } finally {
            setUpdating(false);
        }
    };

    const toggleChecklistItem = (id: number) => {
        setChecklist((prev) =>
            prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
        );
    };

    const getStepIndex = (status: string) => {
        return STATUS_STEPS.findIndex((s) => s.key === status);
    };

    const currentStepIdx = selectedAssignment ? getStepIndex(selectedAssignment.status) : -1;
    const completedTasksCount = checklist.filter((c) => c.done).length;
    const progressPercent = Math.round((completedTasksCount / checklist.length) * 100);

    const formatTimer = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="flex h-[500px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!selectedAssignment) {
        return (
            <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-extrabold tracking-tight">Task Status Management</h1>
                <Card className="p-12 text-center border-dashed">
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="text-xl font-bold">No assigned cleaning jobs</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                        You currently have no active assignments. Once a client booking is assigned to you by the administrator, you can track and advance your task status here.
                    </p>
                    <Button onClick={() => (window.location.href = "/worker/schedule-management")} className="mt-6">
                        View Schedule
                    </Button>
                </Card>
            </div>
        );
    }

    const b = selectedAssignment.booking;

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        Task Status Management
                        <Badge
                            className={`text-xs ${
                                selectedAssignment.status === "COMPLETED"
                                    ? "bg-emerald-500/15 text-emerald-700"
                                    : "bg-blue-500/15 text-blue-700 animate-pulse"
                            }`}
                        >
                            {selectedAssignment.status.replace("_", " ")}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                        Advance your real-time cleaning status so clients and dispatch can track your progress.
                    </p>
                </div>

                {/* Assignment switcher dropdown/tabs if worker has multiple assignments */}
                {assignments.length > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Task:</span>
                        <select
                            value={selectedAssignment.id}
                            onChange={(e) => {
                                const target = assignments.find((a) => a.id === e.target.value);
                                if (target) setSelectedAssignment(target);
                            }}
                            className="border rounded-lg px-3 py-1.5 bg-background text-sm font-medium"
                        >
                            {assignments.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.booking?.service?.name} ({a.status})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Live Status Progression Stepper */}
            <Card className="border p-6 shadow-xs bg-linear-to-r from-card via-card to-primary/5">
                <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                Active Job Flow
                            </span>
                            <h2 className="text-xl md:text-2xl font-black">{b.service?.name}</h2>
                        </div>

                        {selectedAssignment.status === "IN_PROGRESS" && (
                            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl">
                                <Clock className="w-5 h-5 text-primary animate-spin" />
                                <div>
                                    <div className="text-xs text-muted-foreground font-semibold">Active Timer</div>
                                    <div className="text-lg font-mono font-bold text-primary">
                                        {formatTimer(secondsElapsed)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stepper Steps */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                        {STATUS_STEPS.map((step, idx) => {
                            const isCurrent = step.key === selectedAssignment.status;
                            const isDone = currentStepIdx >= idx && selectedAssignment.status !== "DECLINED";
                            const StepIcon = step.icon;

                            return (
                                <div
                                    key={step.key}
                                    className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 ${
                                        isCurrent
                                            ? "border-primary bg-primary text-primary-foreground shadow-md scale-102"
                                            : isDone
                                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                            : "border-muted bg-muted/40 text-muted-foreground"
                                    }`}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                            isCurrent
                                                ? "bg-white/20 text-white"
                                                : isDone
                                                ? "bg-emerald-500 text-white"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {isDone && !isCurrent ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <StepIcon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="font-bold text-xs">{step.label}</div>
                                    <div
                                        className={`text-[10px] hidden sm:block ${
                                            isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
                                        }`}
                                    >
                                        {step.description}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Advance Action Buttons */}
                    <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-4">
                        <div className="text-xs text-muted-foreground">
                            {selectedAssignment.status === "COMPLETED"
                                ? "This service has been fulfilled. No further status changes needed."
                                : "Tap the button below as soon as you transition to the next phase:"}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {selectedAssignment.status === "ASSIGNED" && (
                                <Button
                                    onClick={() => handleUpdateStatus("ACCEPTED")}
                                    disabled={updating}
                                    className="gap-2 font-bold"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Accept Assignment
                                </Button>
                            )}

                            {selectedAssignment.status === "ACCEPTED" && (
                                <Button
                                    onClick={() => handleUpdateStatus("ON_THE_WAY")}
                                    disabled={updating}
                                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                                    I Am On The Way
                                </Button>
                            )}

                            {selectedAssignment.status === "ON_THE_WAY" && (
                                <Button
                                    onClick={() => handleUpdateStatus("ARRIVED")}
                                    disabled={updating}
                                    className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPinCheck className="w-4 h-4" />}
                                    I Have Arrived at Location
                                </Button>
                            )}

                            {selectedAssignment.status === "ARRIVED" && (
                                <Button
                                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                                    disabled={updating}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                    Start Cleaning Now
                                </Button>
                            )}

                            {selectedAssignment.status === "IN_PROGRESS" && (
                                <Button
                                    onClick={() => handleUpdateStatus("COMPLETED")}
                                    disabled={updating}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                                    Mark as Completed
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Split Details: Left Client & Service Info, Right Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client & Booking Information */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                Client Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {b.client?.firstName?.[0]}
                                    {b.client?.lastName?.[0]}
                                </div>
                                <div>
                                    <div className="font-bold">
                                        {b.client?.firstName} {b.client?.lastName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{b.client?.email}</div>
                                </div>
                            </div>

                            {b.client?.phone && (
                                <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Phone className="w-4 h-4 text-primary" />
                                        <span>{b.client.phone}</span>
                                    </div>
                                    <a
                                        href={`tel:${b.client.phone}`}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        Call
                                    </a>
                                </div>
                            )}

                            <div className="pt-2 border-t space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground">Service Address</span>
                                <div className="flex items-start gap-2 text-xs text-foreground bg-muted/30 p-2.5 rounded-lg border">
                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span>{b.address}</span>
                                </div>
                                {b.latitude != null && b.longitude != null ? (
                                    <RouteMap latitude={b.latitude} longitude={b.longitude} address={b.address} />
                                ) : (
                                    <p className="text-xs text-muted-foreground">The client did not pin a map location for this booking.</p>
                                )}
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${
                                        b.latitude != null && b.longitude != null
                                            ? `${b.latitude},${b.longitude}`
                                            : encodeURIComponent(b.address)
                                    }`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                                >
                                    Open in Google Maps
                                    <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Service Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Service Type</span>
                                <span className="font-bold">{b.service?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Estimated Duration</span>
                                <span>{b.duration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span>{new Date(b.bookingDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payout / Rate</span>
                                <span className="font-bold text-primary text-sm">₱{b.totalAmount}</span>
                            </div>
                            {b.service?.description && (
                                <div className="pt-2 border-t text-muted-foreground italic">
                                    "{b.service.description}"
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Interactive Cleaning Checklist */}
                <div className="lg:col-span-2">
                    <Card className="border h-full flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                        Standard Cleaning Checklist
                                    </CardTitle>
                                    <CardDescription>
                                        Check off each item to ensure thorough execution of the service standards.
                                    </CardDescription>
                                </div>
                                <span className="text-sm font-bold text-primary">
                                    {progressPercent}% Complete
                                </span>
                            </div>
                            <Progress value={progressPercent} className="h-2 mt-2" />
                        </CardHeader>

                        <CardContent className="space-y-2.5 flex-1">
                            {checklist.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleChecklistItem(item.id)}
                                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                        item.done
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300 line-through"
                                            : "bg-card border-border hover:border-primary/40 hover:bg-muted/30"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={item.done}
                                        onChange={() => {}}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
                                    />
                                    <span className="text-sm font-medium">{item.text}</span>
                                </div>
                            ))}
                        </CardContent>

                        <div className="p-6 border-t bg-muted/20 rounded-b-xl flex items-center justify-between text-xs text-muted-foreground">
                            <span>HCSS Certified Quality Standard</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setChecklist((prev) => prev.map((item) => ({ ...item, done: true })))
                                }
                            >
                                Mark All As Done
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
