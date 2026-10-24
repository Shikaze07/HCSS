"use client";

import { useState, useEffect } from "react";
import {
    Loader2,
    Search,
    ClipboardList,
    RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobAssignmentCard } from "./components/JobAssignmentCard";
import { toast } from "sonner";

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
    service: Service;
    client: Client;
}

interface Assignment {
    id: string;
    bookingId: string;
    workerId: string;
    status: "ASSIGNED" | "ACCEPTED" | "DECLINED" | "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED";
    assignedAt: string;
    booking: Booking;
}

export default function WorkerJobAssignmentPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const fetchAssignments = async () => {
        try {
            const res = await fetch("/api/worker/assignments");
            if (res.ok) {
                const data = await res.json();
                setAssignments(data);
            } else {
                toast.error("Failed to load assignments.");
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
            toast.error("An error occurred while fetching your assignments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
        // Set up interval for refreshes
        const interval = setInterval(fetchAssignments, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch =
            assignment.booking.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.booking.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${assignment.booking.client.firstName} ${assignment.booking.client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === "all") return matchesSearch;
        if (activeTab === "pending") return matchesSearch && assignment.status === "ASSIGNED";
        if (activeTab === "active") return matchesSearch && ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"].includes(assignment.status);
        if (activeTab === "completed") return matchesSearch && assignment.status === "COMPLETED";
        if (activeTab === "declined") return matchesSearch && assignment.status === "DECLINED";

        return matchesSearch;
    });

    const pendingCount = assignments.filter(a => a.status === "ASSIGNED").length;

    if (loading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl space-y-6 p-4 md:p-6">
            <div className="flex items-baseline justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Job Assignments</h1>
                    <p className="text-sm text-muted-foreground">
                        {assignments.length} total{pendingCount > 0 && ` · ${pendingCount} new`}
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchAssignments} aria-label="Refresh">
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search client, service, or location"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">New{pendingCount > 0 && ` (${pendingCount})`}</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Done</TabsTrigger>
                    <TabsTrigger value="declined">Declined</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    {filteredAssignments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredAssignments.map((assignment) => (
                                <JobAssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    onStatusUpdate={fetchAssignments}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-dashed text-center">
                            <ClipboardList className="w-8 h-8 text-muted-foreground/50 mb-3" />
                            <p className="text-sm font-medium">
                                {searchQuery ? "No matching jobs" : "No jobs here"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {searchQuery ? "Try a different search." : "New assignments will show up here."}
                            </p>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}
