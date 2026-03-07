"use client"

import { useState } from "react"
import { Star, Send, MessageSquare, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ReviewSection({ booking, onReviewSubmitted }) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/client/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: booking.id,
                    rating,
                    comment,
                }),
            })

            if (res.ok) {
                toast.success("Thank you for your review!")
                if (onReviewSubmitted) onReviewSubmitted()
                // Refresh local state if passed from parent
                window.location.reload()
            } else {
                const error = await res.json()
                toast.error(error.error || "Failed to submit review")
            }
        } catch (error) {
            console.error("Error submitting review:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (booking.review) {
        return (
            <div className="pt-8 border-t space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        Your Review
                    </h3>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    "h-5 w-5",
                                    star <= booking.review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                                )}
                            />
                        ))}
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 italic text-muted-foreground font-medium relative">
                    <MessageSquare className="absolute -top-3 -left-3 h-8 w-8 text-primary/10 fill-primary/10 rotate-12" />
                    "{booking.review.comment || "No comment provided."}"
                </div>
            </div>
        )
    }

    return (
        <div className="pt-8 border-t space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">How was the service?</h3>
                <p className="text-sm font-semibold text-muted-foreground">Your feedback helps us improve our cleaning standards.</p>
            </div>

            <div className="space-y-8 p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 shadow-inner">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "h-10 w-10 transition-colors",
                                        (hover || rating) >= star ? "fill-primary text-primary" : "text-muted-foreground/30"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-primary/60">
                        {rating > 0 ? `${rating} Stars Selected` : "Tap to rate"}
                    </span>
                </div>

                {/* Comment area */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        Add a Comment (Optional)
                    </div>
                    <Textarea
                        placeholder="Tell us about your experience..."
                        className="min-h-[120px] rounded-2xl border-none bg-background/50 focus-visible:ring-primary/30 font-medium resize-none"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <Button
                    className="w-full h-14 rounded-2xl font-black text-lg uppercase tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                            Submitting...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Submit Review
                        </div>
                    )}
                </Button>
            </div>
        </div>
    )
}
