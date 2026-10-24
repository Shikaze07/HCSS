"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

export function EditAssignmentModal({ assignment, open, setOpen, onAssignmentUpdated }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [workers, setWorkers] = useState([])
    const [formData, setFormData] = useState({
        workerId: "",
        status: "",
    })

    useEffect(() => {
        if (open && assignment) {
            fetchWorkers(assignment.bookingId)
        }
    }, [open, assignment])

    useEffect(() => {
        if (assignment) {
            setFormData({
                workerId: assignment.workerId || "",
                status: assignment.status || "ASSIGNED",
            })
        }
    }, [assignment])

    const fetchWorkers = async (bookingId) => {
        try {
            const res = await fetch(`/api/admin/workers?bookingId=${bookingId}`)
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

        if (!formData.workerId || !formData.status) {
            toast.error("Please fill in required fields")
            return
        }

        try {
            setIsSubmitting(true)
            const res = await fetch(`/api/admin/assignments/${assignment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to update assignment")
                return
            }

            toast.success("Assignment updated successfully!")
            onAssignmentUpdated(data)
            setOpen(false)
        } catch (error) {
            toast.error("An error occurred while updating the assignment")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!assignment) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Assignment</DialogTitle>
                </DialogHeader>
                <div className="py-2 text-sm text-gray-500">
                    <p><strong>Booking:</strong> {assignment.booking.client.firstName} {assignment.booking.client.lastName} - {assignment.booking.service.name}</p>
                    <p><strong>Date:</strong> {new Date(assignment.booking.bookingDate).toLocaleDateString()}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Worker *</Label>
                        <Select
                            value={formData.workerId}
                            onValueChange={(v) => handleSelectChange("workerId", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a worker" />
                            </SelectTrigger>
                            <SelectContent>
                                {workers.map((worker) => {
                                    // The currently assigned worker stays selectable
                                    const blocked = worker.available === false && worker.id !== assignment.workerId
                                    return (
                                        <SelectItem key={worker.id} value={worker.id} disabled={blocked}>
                                            {worker.firstName} {worker.lastName}
                                            {blocked && (
                                                <span className="text-xs text-muted-foreground"> ({worker.unavailableReason})</span>
                                            )}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Status *</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(v) => handleSelectChange("status", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                <SelectItem value="DECLINED">Declined</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
