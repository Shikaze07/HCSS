"use client";

import { useState, useEffect } from "react";
import {
    Briefcase,
    Loader2,
    Search,
    Filter,
    ClipboardList,
    AlertCircle,
    CalendarCheck,
    CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    service: Service;
    client: Client;
}

interface Assignment {
    id: string;
    bookingId: string;
    workerId: string;
    status: "ASSIGNED" | "ACCEPTED" | "DECLINED" | "ON_THE_WAY" | "ARRIVED" | "COMPLETED";
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
        if (activeTab === "active") return matchesSearch && ["ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(assignment.status);
        if (activeTab === "completed") return matchesSearch && assignment.status === "COMPLETED";
        if (activeTab === "declined") return matchesSearch && assignment.status === "DECLINED";

        return matchesSearch;
    });

    const pendingCount = assignments.filter(a => a.status === "ASSIGNED").length;

    if (loading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Scanning your schedule...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent p-6 rounded-3xl border border-primary/10 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Job Assignments</h1>
                    </div>
                    <p className="text-muted-foreground text-sm md:text-base max-w-md ml-1">
                        View and manage your assigned cleaning tasks. Stay organized and keep your clients happy!
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm p-4 rounded-2xl border shadow-sm">
                    <div className="text-center px-4 border-r">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                        <p className="text-2xl font-black text-primary">{assignments.length}</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">New Tasks</p>
                        <p className={`text-2xl font-black ${pendingCount > 0 ? "text-orange-500" : "text-muted-foreground/30"}`}>
                            {pendingCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col md:flex-row gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-lg pb-4 pt-1">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by client, service, or location..."
                        className="pl-10 h-12 rounded-xl border-2 focus-visible:ring-primary/20 transition-all bg-muted/20 hover:bg-muted/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-12 px-5 rounded-xl border-2 hover:bg-muted/50 transition-all">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-xl border-2 hover:bg-primary/10 transition-all"
                        onClick={fetchAssignments}
                    >
                        <CalendarCheck className="w-5 h-5 text-primary" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 h-auto p-1.5 bg-muted/30 rounded-2xl border-2 border-muted max-w-2xl">
                    <TabsTrigger value="all" className="rounded-xl py-2.5 transition-all data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
                        All
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="rounded-xl py-2.5 transition-all data-[state=active]:shadow-md data-[state=active]:bg-orange-500 data-[state=active]:text-white font-semibold">
                        New
                        {pendingCount > 0 && (
                            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-orange-600 font-bold animate-pulse">
                                {pendingCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="rounded-xl py-2.5 transition-all data-[state=active]:shadow-md data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold">
                        Active
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-xl py-2.5 transition-all data-[state=active]:shadow-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold">
                        Done
                    </TabsTrigger>
                    <TabsTrigger value="declined" className="rounded-xl py-2.5 transition-all data-[state=active]:shadow-md data-[state=active]:bg-rose-600 data-[state=active]:text-white font-semibold">
                        No
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    {filteredAssignments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAssignments.map((assignment) => (
                                <JobAssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    onStatusUpdate={fetchAssignments}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border-2 border-dashed bg-muted/10 group">
                            <div className="p-5 bg-muted/20 rounded-full mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-500">
                                {activeTab === "completed" ? (
                                    <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 group-hover:text-emerald-500/60 transition-colors" />
                                ) : (
                                    <ClipboardList className="w-12 h-12 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                {searchQuery ? "No matching tasks found" : `No ${activeTab !== 'all' ? activeTab : ''} assignments found`}
                            </h3>
                            <p className="text-muted-foreground text-center max-w-sm mb-8">
                                {searchQuery
                                    ? "Try adjusting your search terms to find what you're looking for."
                                    : activeTab === 'pending'
                                        ? "Great! You have no new assignments waiting. Check back soon for more work."
                                        : "Your schedule is clear right now. New assignments will appear here once they're made."
                                }
                            </p>

                        </div>
                    )}
                </div>
            </Tabs>

            {/* Help/Support Section */}
            <div className="bg-primary/5 rounded-3xl p-6 border flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="font-bold">Need help with an assignment?</p>
                    <p className="text-sm text-muted-foreground">If you're having trouble with a location or client, please contact admin support immediately.</p>
                </div>
                <Button className="rounded-xl font-bold" variant="outline">
                    Contact Support
                </Button>
            </div>
        </div>
    );
}
