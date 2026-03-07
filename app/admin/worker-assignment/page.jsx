"use client"

import { useState, useEffect } from "react"
import { AddAssignmentModal } from "./component/addAssignmentModal"
import { EditAssignmentModal } from "./component/editAssignmentModal"
import { DeleteAssignmentModal } from "./component/deleteAssignmentModal"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function WorkerAssignmentPage() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedAssignment, setSelectedAssignment] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [assignmentToDelete, setAssignmentToDelete] = useState(null)

    // Fetch assignments
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await fetch("/api/admin/assignments")
                const result = await res.json()
                if (res.ok) {
                    setData(result)
                } else {
                    toast.error(result.error || "Failed to fetch assignments")
                }
            } catch (error) {
                toast.error("An error occurred while fetching assignments")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchAssignments()
    }, [])

    const handleAssignmentAdded = (newAssignment) => {
        setData((prev) => [newAssignment, ...prev])
    }

    const handleEdit = (assignment) => {
        setSelectedAssignment(assignment)
        setIsEditModalOpen(true)
    }

    const handleAssignmentUpdated = (updatedAssignment) => {
        setData((prev) =>
            prev.map((item) => (item.id === updatedAssignment.id ? updatedAssignment : item))
        )
    }

    const handleDeleteRequest = (assignment) => {
        setAssignmentToDelete(assignment)
        setIsDeleteModalOpen(true)
    }

    const handleAssignmentDeleted = (id) => {
        setData((prev) => prev.filter((item) => item.id !== id))
    }

    if (loading) {
        return (
            <div className="flex h-[450px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Worker Assignment</h1>
                <AddAssignmentModal onAssignmentAdded={handleAssignmentAdded} />
            </div>

            <DataTable columns={columns(handleEdit, handleDeleteRequest)} data={data} />

            <EditAssignmentModal
                assignment={selectedAssignment}
                open={isEditModalOpen}
                setOpen={setIsEditModalOpen}
                onAssignmentUpdated={handleAssignmentUpdated}
            />

            <DeleteAssignmentModal
                assignment={assignmentToDelete}
                open={isDeleteModalOpen}
                setOpen={setIsDeleteModalOpen}
                onAssignmentDeleted={handleAssignmentDeleted}
            />
        </div>
    )
}
