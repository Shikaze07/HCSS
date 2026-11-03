"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Users,
    Briefcase,
    Star,
    CheckCircle2,
    Calendar,
    Download,
    FileText,
    ArrowUpRight,
    Loader2,
    PieChart,
    ShieldCheck,
    CreditCard,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const PAGE_SIZE = 5;

export default function AdminReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState("all");
    const [activeTab, setActiveTab] = useState("demand");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/reports");
            if (res.ok) {
                const reportData = await res.json();
                setData(reportData);
            } else {
                toast.error("Failed to load reports");
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("An error occurred while generating reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, activeTab]);

    if (loading) {
        return (
            <div className="flex h-[500px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const kpi = data?.kpi || {};
    const serviceDemand = data?.serviceDemand || [];
    const workerPerformance = data?.workerPerformance || [];
    const recentReviews = data?.recentReviews || [];
    const paymentMethods = data?.paymentMethods || {};

    const completionRate = kpi.totalBookings > 0
        ? Math.round((kpi.completedBookings / kpi.totalBookings) * 100)
        : 100;

    const q = search.toLowerCase().trim();
    const filteredDemand = serviceDemand.filter((s: any) => !q || s.name?.toLowerCase().includes(q));
    const filteredWorkers = workerPerformance.filter((w: any) =>
        !q || w.name?.toLowerCase().includes(q) || w.email?.toLowerCase().includes(q));
    const filteredReviews = recentReviews.filter((r: any) =>
        !q ||
        `${r.client?.firstName} ${r.client?.lastName}`.toLowerCase().includes(q) ||
        `${r.worker?.firstName} ${r.worker?.lastName}`.toLowerCase().includes(q) ||
        r.booking?.service?.name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q));
    const filteredPayments = Object.entries(paymentMethods).filter(([m]) => !q || m.toLowerCase().includes(q));

    const activeCount =
        activeTab === "demand" ? filteredDemand.length :
        activeTab === "performance" ? filteredWorkers.length :
        activeTab === "satisfaction" ? filteredReviews.length : 0;
    const totalPages = Math.max(1, Math.ceil(activeCount / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginate = (arr: any[]) => arr.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const pager = activeCount > 0 && activeTab !== "payments" && (
        <div className="flex items-center justify-between text-xs text-muted-foreground print:hidden">
            <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, activeCount)} of {activeCount}
            </span>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                    Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                    Next
                </Button>
            </div>
        </div>
    );

    const exportPdf = async () => {
        try {
            const { jsPDF } = await import("jspdf");
            const autoTable = (await import("jspdf-autotable")).default;
            const doc = new jsPDF();
            const peso = (n: number) => `PHP ${Number(n || 0).toLocaleString()}`;
            const titles: Record<string, string> = {
                demand: "Service Demand & Revenue Breakdown",
                performance: "Worker Performance Leaderboard",
                satisfaction: "Customer Ratings & Reviews",
                payments: "Payment Methods",
            };

            doc.setFontSize(16);
            doc.text("HCSS Report", 14, 16);
            doc.setFontSize(11);
            doc.text(titles[activeTab], 14, 24);
            doc.setFontSize(9);
            doc.text(`Generated: ${new Date().toLocaleString()}${q ? `  |  Filter: "${search}"` : ""}`, 14, 30);
            doc.text(
                `Revenue: ${peso(kpi.totalRevenue)}  |  Bookings: ${kpi.completedBookings}/${kpi.totalBookings}  |  Avg rating: ${kpi.overallAvgRating ?? "No ratings yet"}`,
                14, 35
            );

            let head: string[][] = [];
            let body: any[][] = [];
            if (activeTab === "demand") {
                head = [["Service", "Rate", "Bookings", "Completed", "Revenue"]];
                body = filteredDemand.map((s: any) => [s.name, peso(s.price), s.totalBookings, s.completedBookings, peso(s.revenue)]);
            } else if (activeTab === "performance") {
                head = [["Cleaner", "Email", "Assigned", "Completed", "Revenue", "Rating"]];
                body = filteredWorkers.map((w: any) => [w.name, w.email, w.totalAssigned, w.completedJobs, peso(w.revenueGenerated), w.avgRating != null ? `${w.avgRating} (${w.reviewCount})` : "No ratings yet"]);
            } else if (activeTab === "satisfaction") {
                head = [["Client", "Service", "Cleaner", "Rating", "Comment", "Date"]];
                body = filteredReviews.map((r: any) => [
                    `${r.client?.firstName} ${r.client?.lastName}`,
                    r.booking?.service?.name || "",
                    `${r.worker?.firstName} ${r.worker?.lastName}`,
                    `${r.rating}/5`,
                    r.comment || "",
                    new Date(r.createdAt).toLocaleDateString(),
                ]);
            } else {
                head = [["Method", "Amount"]];
                body = filteredPayments.map(([m, a]: [string, any]) => [m, peso(a)]);
            }

            autoTable(doc, { startY: 40, head, body, styles: { fontSize: 8 } });
            doc.save(`hcss-report-${activeTab}-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Failed to export PDF");
        }
    };

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full print:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        Reports

                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                        Executive insights on revenue streams, cleaning service demand, staff performance, and customer satisfaction.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={fetchReports}
                        className="gap-1.5"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Data
                    </Button>
                    <Button size="sm" variant="outline" onClick={exportPdf} className="gap-1.5">
                        <Download className="w-4 h-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Realized Revenue
                        </CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-base">
                            ₱
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">
                            ₱{kpi.totalRevenue?.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 inline" />
                            From fulfilled & paid service invoices
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Bookings Delivered
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">
                            {kpi.completedBookings} / {kpi.totalBookings}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Progress value={completionRate} className="h-2 flex-1" />
                            <span className="text-xs font-bold">{completionRate}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Customer Satisfaction
                        </CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                            <Star className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground flex items-center gap-1.5">
                            {kpi.overallAvgRating ?? "No ratings yet"}
                            {kpi.overallAvgRating != null && (
                                <span className="text-sm text-muted-foreground font-normal">/ 5.0</span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Based on {kpi.totalReviews} verified client reviews
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Cleaners
                        </CardTitle>
                        <div className="p-2 bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                            <Users className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">
                            {kpi.totalWorkers}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {kpi.totalClients} registered clients in system
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Reports Tabs */}
            <div className="relative max-w-md print:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search current report..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-card"
                />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="bg-muted p-1 print:hidden">
                    <TabsTrigger value="demand" className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        Service Demand Analytics
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="gap-2">
                        <Users className="w-4 h-4" />
                        Worker Performance
                    </TabsTrigger>
                    <TabsTrigger value="satisfaction" className="gap-2">
                        <Star className="w-4 h-4" />
                        Customer Ratings & Reviews
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Methods
                    </TabsTrigger>
                </TabsList>

                {/* 1. Service Demand Analytics */}
                <TabsContent value="demand" className="space-y-4">
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-lg">Service Demand & Revenue Breakdown</CardTitle>
                            <CardDescription>
                                Track which cleaning packages generate the highest volume and booking turnover.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b">
                                        <tr>
                                            <th className="py-3 px-4">Service Package</th>
                                            <th className="py-3 px-4">Standard Rate</th>
                                            <th className="py-3 px-4 text-center">Total Bookings</th>
                                            <th className="py-3 px-4 text-center">Completed</th>
                                            <th className="py-3 px-4 text-right">Revenue Generated</th>
                                            <th className="py-3 px-4">Demand Share</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paginate(filteredDemand).map((s: any) => {
                                            const share = kpi.totalBookings > 0
                                                ? Math.round((s.totalBookings / kpi.totalBookings) * 100)
                                                : 0;

                                            return (
                                                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-foreground">
                                                        {s.name}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-muted-foreground">
                                                        ₱{s.price.toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-bold">
                                                        {s.totalBookings}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center text-emerald-600 font-semibold">
                                                        {s.completedBookings}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-black text-foreground">
                                                        ₱{s.revenue.toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-4 min-w-[140px]">
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={share} className="h-2 flex-1" />
                                                            <span className="text-xs font-semibold text-muted-foreground w-8">
                                                                {share}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                    {pager}
                </TabsContent>

                {/* 2. Worker Performance */}
                <TabsContent value="performance" className="space-y-4">
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-lg">Worker Performance Leaderboard</CardTitle>
                            <CardDescription>
                                Monitor completed cleaning tasks, revenue output, and client feedback ratings per staff member.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b">
                                        <tr>
                                            <th className="py-3 px-4">Cleaner Name</th>
                                            <th className="py-3 px-4">Contact</th>
                                            <th className="py-3 px-4 text-center">Assigned Jobs</th>
                                            <th className="py-3 px-4 text-center">Completed</th>
                                            <th className="py-3 px-4 text-right">Revenue Handled</th>
                                            <th className="py-3 px-4 text-center">Average Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paginate(filteredWorkers).map((w: any) => (
                                            <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3.5 px-4 font-bold text-foreground">
                                                    {w.name}
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-muted-foreground">
                                                    {w.email}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-semibold">
                                                    {w.totalAssigned}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <Badge className="bg-emerald-500/15 text-emerald-700">
                                                        {w.completedJobs} finished
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-black text-foreground">
                                                    ₱{w.revenueGenerated.toLocaleString()}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    {w.avgRating != null ? (
                                                        <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                            {w.avgRating}
                                                            <span className="text-xs text-muted-foreground font-normal">
                                                                ({w.reviewCount})
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No ratings yet</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                    {pager}
                </TabsContent>

                {/* 3. Customer Ratings & Reviews */}
                <TabsContent value="satisfaction" className="space-y-4">
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Verified Customer Reviews</CardTitle>
                            <CardDescription>
                                Direct feedback left by clients after completion of their cleaning appointments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredReviews.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No customer reviews found.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {paginate(filteredReviews).map((rev: any) => (
                                        <div
                                            key={rev.id}
                                            className="p-4 rounded-xl border bg-card/60 space-y-2 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">
                                                        {rev.client?.firstName} {rev.client?.lastName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        for {rev.booking?.service?.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    {[...Array(rev.rating)].map((_, i) => (
                                                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                                                    ))}
                                                </div>
                                            </div>
                                            {rev.comment && (
                                                <p className="text-muted-foreground italic text-xs">
                                                    "{rev.comment}"
                                                </p>
                                            )}
                                            <div className="text-[10px] text-muted-foreground">
                                                Cleaner: {rev.worker?.firstName} {rev.worker?.lastName} •{" "}
                                                {new Date(rev.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {pager}
                </TabsContent>

                {/* 4. Payment Methods */}
                <TabsContent value="payments" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredPayments.map(([method, amount]: [string, any]) => (
                            <Card key={method} className="border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                                        {method}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        ₱{amount.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Settled through {method}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
