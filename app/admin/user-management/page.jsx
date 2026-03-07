"use client"

import { useState, useEffect } from "react"
import { AddUserModal } from "./component/addUserModal"
import { EditUserModal } from "./component/editUserModal"
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function UserManagementPage() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                const res = await fetch("/api/admin/users")
                if (!res.ok) throw new Error("Failed to fetch users")
                const users = await res.json()
                setData(users)
            } catch (error) {
                toast.error("Failed to load users")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const handleUserAdded = (newUser) => {
        setData((prev) => [newUser, ...prev])
    }

    const handleEdit = (user) => {
        setSelectedUser(user)
        setIsEditModalOpen(true)
    }

    const handleUserUpdated = (updatedUser) => {
        setData((prev) =>
            prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        )
    }

    const handleDeleteClick = (user) => {
        setSelectedUser(user)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!selectedUser) return

        try {
            setIsDeleting(true)
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const error = await res.json()
                toast.error(error.error || "Failed to delete user")
                return
            }

            toast.success("User deleted successfully")
            setData((prev) => prev.filter((user) => user.id !== selectedUser.id))
            setIsDeleteModalOpen(false)
        } catch (error) {
            toast.error("An error occurred while deleting the user")
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
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
                <h1 className="text-3xl font-bold">User Management</h1>
                <AddUserModal onUserAdded={handleUserAdded} />
            </div>

            <DataTable columns={columns(handleEdit, handleDeleteClick)} data={data} />

            <EditUserModal
                user={selectedUser}
                open={isEditModalOpen}
                setOpen={setIsEditModalOpen}
                onUserUpdated={handleUserUpdated}
            />

            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                title="Delete User"
                description={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
            />
        </div>
    )
}
