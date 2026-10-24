"use client";

import { useState } from "react";
import {
    Calendar,
    MapPin,
    Phone,
    Mail,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const RouteMap = dynamic(
    () => import("@/components/maps/RouteMap").then((m) => m.RouteMap),
    { ssr: false, loading: () => <div className="h-64 w-full rounded-lg border bg-muted/40 animate-pulse" /> }
);

const STATUS_LABELS = {
    ASSIGNED: "New",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    ON_THE_WAY: "On the way",
    ARRIVED: "Arrived",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
};

// The next step a worker can take from each status
const NEXT_ACTION = {
    ACCEPTED: { status: "ON_THE_WAY", label: "On the way" },
    ON_THE_WAY: { status: "ARRIVED", label: "Arrived at location" },
    ARRIVED: { status: "IN_PROGRESS", label: "Start cleaning" },
    IN_PROGRESS: { status: "COMPLETED", label: "Mark as completed" },
};

export function JobAssignmentCard({ assignment, onStatusUpdate }) {
    const [updating, setUpdating] = useState(false);
    const { booking, status } = assignment;
    const { service, client, startTime, endTime, address, latitude, longitude } = booking;
    const hasPin = latitude != null && longitude != null;
    const next = NEXT_ACTION[status];

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/worker/assignments/${assignment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Job status updated successfully.`);
                onStatusUpdate();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to update status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const formatTime = (d) =>
        new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    return (
        <Card className="gap-0 py-0">
            <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-3">
                <div className="min-w-0">
                    <CardTitle className="text-base font-semibold truncate">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(startTime)} · {formatTime(startTime)} – {formatTime(endTime)}
                    </p>
                </div>
                <Badge variant={status === "ASSIGNED" ? "default" : "secondary"} className="shrink-0">
                    {STATUS_LABELS[status] || status}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-3 px-4 pb-4 text-sm">
                <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                    <span>{address}</span>
                </p>

                {hasPin ? (
                    <RouteMap latitude={latitude} longitude={longitude} address={address} />
                ) : (
                    <p className="text-xs text-muted-foreground">No map pin for this booking.</p>
                )}

                <div className="border-t pt-3 space-y-1">
                    <p className="font-medium">{client.firstName} {client.lastName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                        {client.phone && (
                            <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                                <Phone className="w-3.5 h-3.5" />
                                {client.phone}
                            </a>
                        )}
                        <span className="flex items-center gap-1.5 min-w-0">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{client.email}</span>
                        </span>
                    </div>
                </div>
            </CardContent>

            {(status === "ASSIGNED" || next) && (
                <CardFooter className="gap-2 border-t p-4">
                    {status === "ASSIGNED" ? (
                        <>
                            <Button
                                className="flex-1"
                                disabled={updating}
                                onClick={() => handleUpdateStatus("ACCEPTED")}
                            >
                                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                                Accept
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled={updating}
                                onClick={() => handleUpdateStatus("DECLINED")}
                            >
                                Decline
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="w-full"
                            disabled={updating}
                            onClick={() => handleUpdateStatus(next.status)}
                        >
                            {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                            {next.label}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
