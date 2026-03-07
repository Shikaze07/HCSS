"use client"

import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

export const columns = (onEdit, onDelete) => [
    {
        id: "workerName",
        header: "Worker",
        cell: ({ row }) => {
            const worker = row.original.worker
            if (!worker) return <span className="text-muted-foreground italic">Unknown Worker</span>
            return `${worker.firstName || ""} ${worker.lastName || ""}`.trim() || "Unknown Worker"
        },
    },
    {
        id: "clientName",
        header: "Client",
        cell: ({ row }) => {
            const client = row.original.booking?.client
            if (!client) return <span className="text-muted-foreground italic">Unknown Client</span>
            return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown Client"
        },
    },
    {
        id: "serviceName",
        header: "Service",
        cell: ({ row }) => {
            const serviceName = row.original.booking?.service?.name
            if (!serviceName) return <span className="text-muted-foreground italic">Unknown Service</span>
            return serviceName
        },
    },
    {
        id: "bookingDate",
        header: "Booking Date",
        cell: ({ row }) => {
            const bookingDate = row.original.booking?.bookingDate
            if (!bookingDate) return <span className="text-muted-foreground italic">—</span>
            return new Date(bookingDate).toLocaleDateString()
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status")
            const colors = {
                ASSIGNED: "bg-blue-100 text-blue-800",
                ACCEPTED: "bg-green-100 text-green-800",
                DECLINED: "bg-red-100 text-red-800",
                COMPLETED: "bg-gray-100 text-gray-800",
            }
            return (
                <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "assignedAt",
        header: "Assigned At",
        cell: ({ row }) => {
            const date = new Date(row.getValue("assignedAt"))
            return date.toLocaleDateString()
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const assignment = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(assignment)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onDelete(assignment)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
