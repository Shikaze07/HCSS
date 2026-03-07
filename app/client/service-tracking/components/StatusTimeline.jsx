"use client"

import { cn } from "@/lib/utils"
import {
    CheckCircle2,
    Clock,
    User,
    Navigation,
    House,
    Loader2,
    CheckCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const STATUS_STEPS = [
    { id: "PENDING", label: "Booking Placed", icon: Clock },
    { id: "ASSIGNED", label: "Worker Assigned", icon: User },
    { id: "ON_THE_WAY", label: "On the Way", icon: Navigation },
    { id: "ARRIVED", label: "Arrived", icon: House },
    { id: "IN_PROGRESS", label: "Cleaning in Progress", icon: Loader2 },
    { id: "COMPLETED", label: "Service Completed", icon: CheckCircle },
]

export function StatusTimeline({ currentStepIndex }) {
    return (
        <div className="relative py-12 px-4 md:px-10">
            {/* Desktop horizontal progress line */}
            <div className="absolute top-[76px] left-[10%] right-[10%] h-1 bg-muted rounded-full overflow-hidden hidden md:block">
                <div
                    className="h-full bg-primary transition-all duration-1000 ease-in-out"
                    style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
            </div>

            {/* Mobile vertical progress line */}
            <div className="absolute left-[44px] top-[76px] bottom-[76px] w-1 bg-muted rounded-full overflow-hidden md:hidden">
                <div
                    className="w-full bg-primary transition-all duration-1000 ease-in-out"
                    style={{ height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
            </div>

            <div className="grid md:grid-cols-6 grid-cols-1 gap-12 md:gap-0 relative">
                {STATUS_STEPS.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex

                    return (
                        <div key={step.id} className="flex md:flex-col items-center gap-6 md:gap-6 relative group">
                            <div className={cn(
                                "z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 transition-all duration-500",
                                isCompleted ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110" : "bg-background border-muted text-muted-foreground",
                                isCurrent && "animate-pulse ring-4 ring-primary/20 ring-offset-2"
                            )}>
                                {isCompleted && index < currentStepIndex ? (
                                    <CheckCircle2 className="h-7 w-7" />
                                ) : (
                                    <Icon className={cn("h-7 w-7", isCurrent && index === 4 && "animate-spin")} />
                                )}
                            </div>
                            <div className="flex flex-col md:items-center space-y-1">
                                <span className={cn(
                                    "text-sm font-black md:text-center transition-colors duration-300 tracking-tight",
                                    isCompleted ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <Badge variant="outline" className="h-5 text-[10px] font-bold bg-primary/10 text-primary border-primary/20 uppercase tracking-tighter">Current</Badge>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
