"use client"

import { ServiceList } from "./components/ServiceList"

export default function BookingManagementPage() {
    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
                <p className="text-muted-foreground text-lg">
                    Discover our cleaning services and book your next appointment today.
                </p>
            </div>

            <div className="border-t pt-8">
                <ServiceList />
            </div>
        </div>
    )
}
