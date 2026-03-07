"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, TriangleAlert } from "lucide-react"

export function DeleteAssignmentModal({ assignment, open, setOpen, onAssignmentDeleted }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!assignment) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/assignments/${assignment.id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const error = await res.json()
                toast.error(error.error || "Failed to delete assignment")
                return
            }

            toast.success("Assignment deleted successfully")
            onAssignmentDeleted(assignment.id)
            setOpen(false)
        } catch (error) {
            toast.error("An error occurred while deleting the assignment")
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    const workerName = assignment
        ? `${assignment.worker?.firstName ?? ""} ${assignment.worker?.lastName ?? ""}`.trim() || "this worker"
        : "this worker"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center text-center gap-3 pt-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <TriangleAlert className="h-7 w-7" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Delete Assignment?</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        You are about to remove the assignment for{" "}
                        <span className="font-semibold text-foreground">{workerName}</span>.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => setOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full sm:w-auto"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Assignment"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
