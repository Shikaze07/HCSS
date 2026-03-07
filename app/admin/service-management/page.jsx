"use client"

import { useState, useEffect } from "react"
import { AddServiceModal } from "./component/addServiceModal"
import { EditServiceModal } from "./component/editServiceModal"
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ServiceManagementPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/services")
        if (!res.ok) throw new Error("Failed to fetch services")
        const services = await res.json()
        setData(services)
      } catch (error) {
        toast.error("Failed to load services")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleServiceAdded = (newService) => {
    setData((prev) => [newService, ...prev])
  }

  const handleEdit = (service) => {
    setSelectedService(service)
    setIsEditModalOpen(true)
  }

  const handleServiceUpdated = (updatedService) => {
    setData((prev) =>
      prev.map((service) => (service.id === updatedService.id ? updatedService : service))
    )
  }

  const handleDeleteClick = (service) => {
    setSelectedService(service)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedService) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || "Failed to delete service")
        return
      }

      toast.success("Service deleted successfully")
      setData((prev) => prev.filter((service) => service.id !== selectedService.id))
      setIsDeleteModalOpen(false)
    } catch (error) {
      toast.error("An error occurred while deleting the service")
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
        <h1 className="text-3xl font-bold">Service Management</h1>
        <AddServiceModal onServiceAdded={handleServiceAdded} />
      </div>

      <DataTable columns={columns(handleEdit, handleDeleteClick)} data={data} />

      <EditServiceModal
        service={selectedService}
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        onServiceUpdated={handleServiceUpdated}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete Service"
        description={`Are you sure you want to delete ${selectedService?.name}? This action cannot be undone.`}
      />
    </div>
  )
}
