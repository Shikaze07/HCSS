"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Users,
    Briefcase,
    Clock,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Loader2,
    UserCheck,
    CreditCard,
    FileSpreadsheet,
    ShieldAlert,
    Search,
    ChevronLeft,
    ChevronRight,
    Activity,
    SlidersHorizontal
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Search, Filter & Pagination states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/dashboard");
            if (res.ok) {
                const result = await res.json();
                setData(result);
            } else {
                toast.error("Failed to load admin dashboard");
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
            toast.error("An error occurred while loading dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const kpi = data?.kpi || {};
    const recentBookings: any[] = data?.recentBookings || [];
    const popularServices: any[] = data?.popularServices || [];

    // Filtered bookings
    const filteredBookings = useMemo(() => {
        return recentBookings.filter((b) => {
            const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                b.service?.name?.toLowerCase().includes(searchLower) ||
                b.address?.toLowerCase().includes(searchLower) ||
                `${b.client?.firstName} ${b.client?.lastName}`.toLowerCase().includes(searchLower) ||
                `${b.assignment?.worker?.firstName || ""} ${b.assignment?.worker?.lastName || ""}`.toLowerCase().includes(searchLower);

            return matchesStatus && matchesSearch;
        });
    }, [recentBookings, statusFilter, searchQuery]);

    // Reset to page 1 on search or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // Paginated slice
    const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
    const paginatedBookings = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredBookings.slice(start, start + pageSize);
    }, [filteredBookings, currentPage, pageSize]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Completed</Badge>;
            case "IN_PROGRESS":
                return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400">In Progress</Badge>;
            case "CONFIRMED":
                return <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">Confirmed</Badge>;
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
            <div className="flex h-[550px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header & Status Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                        Dashboard

                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                        Live monitoring and management hub for the Home Cleaning Service System.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = "/admin/reports")}
                        className="gap-2"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Full Analytics
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => (window.location.href = "/admin/worker-assignment")}
                        className="gap-2"
                    >
                        <UserCheck className="w-4 h-4" />
                        Dispatch Worker
                    </Button>
                </div>
            </div>

            {/* Action Alert Banner if unassigned bookings exist */}
            {kpi.unassignedBookingsCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                Attention Required: {kpi.unassignedBookingsCount} booking{kpi.unassignedBookingsCount > 1 ? "s" : ""} waiting for worker assignment!
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Assign cleaners promptly to ensure on-time service delivery.
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => (window.location.href = "/admin/worker-assignment")}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0"
                    >
                        Assign Cleaners Now
                    </Button>
                </div>
            )}

            {/* Core Operational KPI Cards - Uses Peso sign ₱, zero wish icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Realized Revenue
                        </CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-base">
                            ₱
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">₱{kpi.totalRevenue?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 inline" />
                            From {kpi.completedBookings} completed cleanings
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Cleanings
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <Activity className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{kpi.inProgressBookings}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Currently in progress on location
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Bookings
                        </CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{kpi.pendingBookings}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting approval or dispatch
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Cleaners
                        </CardTitle>
                        <div className="p-2 bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                            <Users className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{kpi.totalWorkers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Serving {kpi.totalClients} registered clients
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Action Navigation Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/admin/booking-management")}
                    className="h-auto py-3 px-4 flex flex-col items-start gap-1 text-left border shadow-xs hover:border-primary"
                >
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        Bookings
                    </span>
                    <span className="text-[11px] text-muted-foreground">Approve & reschedule</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/admin/worker-assignment")}
                    className="h-auto py-3 px-4 flex flex-col items-start gap-1 text-left border shadow-xs hover:border-primary"
                >
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-primary" />
                        Worker Dispatch
                    </span>
                    <span className="text-[11px] text-muted-foreground">Assign cleaning tasks</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/admin/service-management")}
                    className="h-auto py-3 px-4 flex flex-col items-start gap-1 text-left border shadow-xs hover:border-primary"
                >
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Services
                    </span>
                    <span className="text-[11px] text-muted-foreground">Prices & descriptions</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/admin/user-management")}
                    className="h-auto py-3 px-4 flex flex-col items-start gap-1 text-left border shadow-xs hover:border-primary"
                >
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary" />
                        User Directory
                    </span>
                    <span className="text-[11px] text-muted-foreground">Clients & cleaners</span>
                </Button>
            </div>

            {/* Live Operations Section with FILTER and PAGINATION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Operations Feed Table */}
                <Card className="border lg:col-span-2 flex flex-col justify-between">
                    <div>
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg">Recent Cleaning Operations</CardTitle>
                                    <CardDescription>
                                        Live appointments and real-time execution status.
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => (window.location.href = "/admin/booking-management")}
                                    className="text-xs font-bold gap-1 text-primary self-start sm:self-auto"
                                >
                                    Manage All
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            {/* Filter Bar */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by client, cleaner, service, address..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 h-8 text-xs bg-card"
                                    />
                                </div>

                                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                                    {["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${statusFilter === status
                                                ? "bg-primary text-primary-foreground font-bold"
                                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                                                }`}
                                        >
                                            {status === "ALL" ? "All" : status.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            {paginatedBookings.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground text-xs">
                                    No cleaning operations match your current filter.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/40 uppercase font-semibold text-muted-foreground border-b text-[10px]">
                                            <tr>
                                                <th className="py-2.5 px-3">Service</th>
                                                <th className="py-2.5 px-3">Client</th>
                                                <th className="py-2.5 px-3">Cleaner</th>
                                                <th className="py-2.5 px-3">Amount</th>
                                                <th className="py-2.5 px-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginatedBookings.map((b: any) => (
                                                <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="py-2.5 px-3 font-semibold text-foreground">
                                                        <div>{b.service?.name}</div>
                                                        <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[150px]">
                                                            {b.address}
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="font-medium text-foreground">
                                                            {b.client?.firstName} {b.client?.lastName}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {b.client?.phone || b.client?.email}
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        {b.assignment?.worker ? (
                                                            <span className="font-medium text-foreground">
                                                                {b.assignment.worker.firstName} {b.assignment.worker.lastName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-amber-600 font-medium">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-black text-foreground">
                                                        ₱{b.totalAmount?.toLocaleString()}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        {getStatusBadge(b.status)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </div>

                    {/* Pagination Controls */}
                    <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-muted/10 rounded-b-xl">
                        <div>
                            Showing{" "}
                            <span className="font-bold text-foreground">
                                {filteredBookings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-foreground">
                                {Math.min(currentPage * pageSize, filteredBookings.length)}
                            </span>{" "}
                            of <span className="font-bold text-foreground">{filteredBookings.length}</span> entries
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="h-7 px-2 text-xs"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                                Prev
                            </Button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${currentPage === page
                                        ? "bg-primary text-primary-foreground font-bold"
                                        : "hover:bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="h-7 px-2 text-xs"
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Popular Services & Offerings - Uses Peso sign ₱ */}
                <Card className="border lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Cleaning Packages</CardTitle>
                        <CardDescription>
                            Active service offerings in catalog.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3.5">
                        {popularServices.map((service: any) => (
                            <div
                                key={service.id}
                                className="p-3 rounded-xl border bg-card/60 flex items-center justify-between gap-3 text-xs"
                            >
                                <div className="space-y-0.5">
                                    <div className="font-bold text-foreground text-sm">
                                        {service.name}
                                    </div>
                                    <div className="text-muted-foreground">
                                        ₱{service.price?.toLocaleString()} • {service.duration} mins
                                    </div>
                                </div>
                                <Badge variant="secondary" className="font-semibold shrink-0">
                                    {service.bookingCount} booked
                                </Badge>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (window.location.href = "/admin/service-management")}
                            className="w-full mt-2"
                        >
                            Manage Catalog
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
