"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export function AddAssignmentModal({ onAssignmentAdded }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookings, setBookings] = useState([])
    const [workers, setWorkers] = useState([])
    const [formData, setFormData] = useState({
        bookingId: "",
        workerId: "",
    })

    useEffect(() => {
        if (open) {
            fetchBookings()
            fetchWorkers()
        }
    }, [open])

    const fetchBookings = async () => {
        try {
            const res = await fetch("/api/admin/bookings")
            const data = await res.json()
            if (res.ok) setBookings(data)
        } catch (error) {
            console.error("Error fetching bookings:", error)
        }
    }

    const fetchWorkers = async () => {
        try {
            const res = await fetch("/api/admin/workers")
            const data = await res.json()
            if (res.ok) setWorkers(data)
        } catch (error) {
            console.error("Error fetching workers:", error)
        }
    }

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.bookingId || !formData.workerId) {
            toast.error("Please select both a booking and a worker")
            return
        }

        try {
            setIsSubmitting(true)
            const res = await fetch("/api/admin/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to create assignment")
                return
            }

            toast.success("Worker assigned successfully!")
            onAssignmentAdded(data)
            setOpen(false)
            setFormData({ bookingId: "", workerId: "" })
        } catch (error) {
            toast.error("An error occurred while creating the assignment")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Assign Worker</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Worker Assignment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Booking *</Label>
                        <Select
                            value={formData.bookingId}
                            onValueChange={(v) => handleSelectChange("bookingId", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an unassigned booking" />
                            </SelectTrigger>
                            <SelectContent>
                                {bookings.length === 0 ? (
                                    <SelectItem disabled value="none">No unassigned bookings</SelectItem>
                                ) : (
                                    bookings.map((booking) => (
                                        <SelectItem key={booking.id} value={booking.id}>
                                            {booking.client?.firstName || "Unknown"} {booking.client?.lastName || "Client"} - {booking.service?.name || "Unknown Service"} ({booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : "No Date"})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Select Worker *</Label>
                        <Select
                            value={formData.workerId}
                            onValueChange={(v) => handleSelectChange("workerId", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a worker" />
                            </SelectTrigger>
                            <SelectContent>
                                {workers.length === 0 ? (
                                    <SelectItem disabled value="none">No active workers available</SelectItem>
                                ) : (
                                    workers.map((worker) => (
                                        <SelectItem key={worker.id} value={worker.id}>
                                            {worker.firstName} {worker.lastName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-4 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || bookings.length === 0 || workers.length === 0}>
                            {isSubmitting ? "Assigning..." : "Assign"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
