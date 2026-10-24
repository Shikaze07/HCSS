"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    Star,
    Receipt,
    Search,
    User,
    Loader2,
    CreditCard,
    FileText,
    ChevronLeft,
    ChevronRight
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

export default function ServiceHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [reviewModalBooking, setReviewModalBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/client/history");
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            } else {
                toast.error("Failed to load service history");
            }
        } catch (error) {
            console.error("Error fetching service history:", error);
            toast.error("An error occurred while loading history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewModalBooking) return;

        try {
            setSubmittingReview(true);
            const res = await fetch("/api/client/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: reviewModalBooking.id,
                    rating,
                    comment,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Failed to submit review");
                return;
            }

            toast.success("Thank you for your rating & feedback!");
            setReviewModalBooking(null);
            setComment("");
            setRating(5);
            fetchHistory();
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Filter logic
    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const matchesStatus =
                statusFilter === "ALL" || item.status === statusFilter;
            const matchesSearch =
                item.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.assignment?.worker &&
                    `${item.assignment.worker.firstName} ${item.assignment.worker.lastName}`
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()));

            return matchesStatus && matchesSearch;
        });
    }, [history, statusFilter, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
    const paginatedHistory = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredHistory.slice(start, start + pageSize);
    }, [filteredHistory, currentPage, pageSize]);

    // Stats calculations
    const completedCount = history.filter((h) => h.status === "COMPLETED").length;
    const totalSpent = history
        .filter((h) => h.status === "COMPLETED")
        .reduce((sum, h) => sum + (h.totalAmount || 0), 0);
    const totalHours = history
        .filter((h) => h.status === "COMPLETED")
        .reduce((sum, h) => sum + Math.round((h.duration || 60) / 60), 0);
    const reviewsGiven = history.filter((h) => h.review).length;

    const getStatusBadge = (status) => {
        switch (status) {
            case "COMPLETED":
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold">
                        Completed
                    </Badge>
                );
            case "IN_PROGRESS":
                return (
                    <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold">
                        In Progress
                    </Badge>
                );
            case "CONFIRMED":
                return (
                    <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 font-semibold">
                        Confirmed
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge variant="outline" className="text-amber-600 border-amber-400/40 font-semibold">
                        Pending
                    </Badge>
                );
            case "CANCELLED":
                return (
                    <Badge variant="destructive" className="font-semibold">
                        Cancelled
                    </Badge>
                );
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
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        Service History
                        <Badge variant="secondary" className="text-sm font-medium">
                            {history.length} Records
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                        Review your past bookings, service details, invoices, and cleaner reviews.
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid - uses Peso sign ₱ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Spent
                        </CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-base">
                            ₱
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱{totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all completed bookings
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Cleanings Completed
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Successfully delivered services
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Cleaning Hours
                        </CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalHours} hrs</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total hours of professional care
                        </p>
                    </CardContent>
                </Card>

                <Card className="border shadow-xs hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Reviews Submitted
                        </CardTitle>
                        <div className="p-2 bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                            <Star className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reviewsGiven}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Feedback ratings shared
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search service, cleaner, or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {["ALL", "COMPLETED", "IN_PROGRESS", "CONFIRMED", "CANCELLED"].map((status) => (
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

            {/* History Cards List with Pagination */}
            {filteredHistory.length === 0 ? (
                <Card className="border border-dashed p-12 text-center flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 text-muted-foreground/40 mb-3" />
                    <h3 className="text-lg font-semibold">No service history records found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
                        {searchQuery || statusFilter !== "ALL"
                            ? "Try adjusting your search criteria or filter to find past records."
                            : "You don't have any past completed services yet. Book your first service today!"}
                    </p>
                    <Button onClick={() => (window.location.href = "/client/booking-management")}>
                        Book a Service
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {paginatedHistory.map((item) => {
                        const dateFormatted = new Date(item.bookingDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        });
                        const startTime = new Date(item.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        const endTime = new Date(item.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        const workerName = item.assignment?.worker
                            ? `${item.assignment.worker.firstName} ${item.assignment.worker.lastName}`
                            : "Cleaner Not Assigned";

                        return (
                            <Card
                                key={item.id}
                                className="overflow-hidden border hover:border-primary/40 transition-all hover:shadow-xs"
                            >
                                <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Left Details */}
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-lg text-foreground">
                                                {item.service?.name || "Cleaning Service"}
                                            </span>
                                            {getStatusBadge(item.status)}
                                            {item.payment && (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${
                                                        item.payment.paymentStatus === "PAID"
                                                            ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/5"
                                                            : "text-amber-600 border-amber-500/30 bg-amber-500/5"
                                                    }`}
                                                >
                                                    <CreditCard className="w-3 h-3 mr-1 inline" />
                                                    {item.payment.method} • {item.payment.paymentStatus}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs md:text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary shrink-0" />
                                                <span>{dateFormatted}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                                <span>
                                                    {startTime} - {endTime} ({item.duration} mins)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary shrink-0" />
                                                <span className="truncate">Cleaner: {workerName}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            <span className="truncate">{item.address}</span>
                                        </div>

                                        {/* Existing review display */}
                                        {item.review && (
                                            <div className="mt-2 p-3 bg-muted/50 rounded-xl border flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-1 font-semibold text-amber-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${
                                                                i < item.review.rating
                                                                    ? "fill-amber-500 text-amber-500"
                                                                    : "text-muted-foreground/30"
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="ml-1 text-foreground text-xs">
                                                        Your rating: {item.review.rating}/5
                                                    </span>
                                                </div>
                                                {item.review.comment && (
                                                    <p className="text-muted-foreground italic">
                                                        "{item.review.comment}"
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Actions & Amount */}
                                    <div className="flex flex-row lg:flex-col lg:items-end justify-between items-center gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0">
                                        <div className="text-left lg:text-right">
                                            <div className="text-xl md:text-2xl font-black text-foreground">
                                                ₱{item.totalAmount?.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Invoice #{item.id.slice(0, 8).toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedReceipt(item)}
                                                className="gap-1.5"
                                            >
                                                <Receipt className="w-4 h-4" />
                                                View Receipt
                                            </Button>

                                            {item.status === "COMPLETED" && !item.review && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => setReviewModalBooking(item)}
                                                    className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                                                >
                                                    <Star className="w-4 h-4 fill-white" />
                                                    Rate Service
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {/* Pagination Bar */}
                    <div className="p-4 border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-card">
                        <div>
                            Showing <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                            <span className="font-bold text-foreground">
                                {Math.min(currentPage * pageSize, filteredHistory.length)}
                            </span>{" "}
                            of <span className="font-bold text-foreground">{filteredHistory.length}</span> records
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
                                    className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                                        currentPage === page
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
                </div>
            )}

            {/* Receipt Modal - NO print option, NO wish icons */}
            <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Receipt className="w-5 h-5" />
                            <span>HCSS Official Invoice</span>
                        </div>
                        <DialogTitle className="text-xl">Payment Details</DialogTitle>
                        <DialogDescription>
                            Transaction ID: {selectedReceipt?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReceipt && (
                        <div className="space-y-4 py-2 text-sm border-y my-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Service</span>
                                <span className="font-semibold text-foreground">
                                    {selectedReceipt.service?.name}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Date of Service</span>
                                <span>
                                    {new Date(selectedReceipt.bookingDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Duration</span>
                                <span>{selectedReceipt.duration} minutes</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Service Address</span>
                                <span className="max-w-[200px] truncate text-right">
                                    {selectedReceipt.address}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Assigned Cleaner</span>
                                <span>
                                    {selectedReceipt.assignment?.worker
                                        ? `${selectedReceipt.assignment.worker.firstName} ${selectedReceipt.assignment.worker.lastName}`
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span className="font-medium">
                                    {selectedReceipt.payment?.method || "CASH"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Payment Status</span>
                                <span>{getStatusBadge(selectedReceipt.payment?.paymentStatus || "PENDING")}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t font-bold text-base">
                                <span>Total Paid</span>
                                <span className="text-primary text-xl">
                                    ₱{selectedReceipt.totalAmount?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex justify-end w-full">
                        <Button onClick={() => setSelectedReceipt(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Submission Modal */}
            <Dialog open={!!reviewModalBooking} onOpenChange={(open) => !open && setReviewModalBooking(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            Rate Your Cleaner
                        </DialogTitle>
                        <DialogDescription>
                            How was your {reviewModalBooking?.service?.name} service? Your feedback helps
                            us ensure top quality.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReviewSubmit} className="space-y-4 py-2">
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-xl space-y-2">
                            <span className="text-sm font-medium text-muted-foreground">Your Rating</span>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="p-1 hover:scale-125 transition-transform"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${
                                                star <= rating
                                                    ? "fill-amber-500 text-amber-500"
                                                    : "text-muted-foreground/30"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                {rating === 5 && "⭐ Outstanding Service!"}
                                {rating === 4 && "⭐ Great Job!"}
                                {rating === 3 && "⭐ Satisfactory"}
                                {rating === 2 && "⭐ Needs Improvement"}
                                {rating === 1 && "⭐ Disappointing"}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Comments or Feedback (optional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share details about the cleanliness, punctuality, and professionalism..."
                                rows={4}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReviewModalBooking(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submittingReview} className="gap-2">
                                {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                                Submit Review
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
