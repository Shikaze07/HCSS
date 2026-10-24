"use client";

import { cn } from "@/lib/utils";
import {
    Check,
    Clock,
    UserCheck,
    Truck,
    MapPin,
    Broom,
    CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_STEPS = [
    { id: "PENDING", label: "Booking Placed", description: "Request received", icon: Clock },
    { id: "ASSIGNED", label: "Cleaner Assigned", description: "Worker confirmed", icon: UserCheck },
    { id: "ON_THE_WAY", label: "On the Way", description: "Traveling to your home", icon: Truck },
    { id: "ARRIVED", label: "Arrived", description: "At service address", icon: MapPin },
    { id: "IN_PROGRESS", label: "Cleaning in Progress", description: "Active cleaning session", icon: CheckCircle2 },
    { id: "COMPLETED", label: "Completed", description: "Service fulfilled", icon: Check },
];

export function StatusTimeline({ currentStepIndex }) {
    return (
        <div className="w-full py-6 px-2 md:px-6">
            {/* Desktop Stepper */}
            <div className="hidden md:block relative">
                {/* Horizontal connector line */}
                <div className="absolute top-6 left-8 right-8 h-1 bg-muted rounded-full">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${Math.min(100, Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100))}%`,
                        }}
                    />
                </div>

                <div className="grid grid-cols-6 gap-2 relative">
                    {STATUS_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isPast = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isFuture = index > currentStepIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center text-center space-y-2.5">
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        "z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 font-bold text-sm shadow-xs",
                                        isPast && "bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/20",
                                        isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20 scale-105",
                                        isFuture && "bg-card border-muted text-muted-foreground"
                                    )}
                                >
                                    {isPast ? (
                                        <Check className="h-6 w-6 stroke-[3]" />
                                    ) : (
                                        <Icon className="h-5 w-5" />
                                    )}
                                </div>

                                {/* Step Label & Status */}
                                <div className="space-y-1 px-1">
                                    <div
                                        className={cn(
                                            "text-xs font-bold leading-tight",
                                            isCurrent && "text-primary",
                                            isPast && "text-foreground",
                                            isFuture && "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {step.description}
                                    </div>
                                    {isCurrent && (
                                        <Badge
                                            className="mt-1 text-[10px] py-0 px-2 font-bold bg-primary text-primary-foreground border-none"
                                        >
                                            Current Phase
                                        </Badge>
                                    )}
                                    {isPast && (
                                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                                            Done ✓
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="md:hidden space-y-4 relative pl-2">
                {STATUS_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isPast = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isFuture = index > currentStepIndex;
                    const isLast = index === STATUS_STEPS.length - 1;

                    return (
                        <div key={step.id} className="relative flex items-start gap-4">
                            {/* Vertical Line */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        "absolute left-5 top-10 bottom-0 w-0.5 -ml-[1px]",
                                        isPast ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            )}

                            {/* Circle */}
                            <div
                                className={cn(
                                    "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all font-bold text-xs shadow-xs",
                                    isPast && "bg-emerald-600 border-emerald-600 text-white",
                                    isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                                    isFuture && "bg-card border-muted text-muted-foreground"
                                )}
                            >
                                {isPast ? <Check className="h-5 w-5 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                            </div>

                            {/* Content */}
                            <div className="pb-3 space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "text-sm font-bold",
                                            isCurrent ? "text-primary" : isPast ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                    {isCurrent && (
                                        <Badge className="text-[9px] py-0 px-1.5 bg-primary text-primary-foreground">
                                            Current
                                        </Badge>
                                    )}
                                    {isPast && (
                                        <span className="text-[10px] font-bold text-emerald-600">✓</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
