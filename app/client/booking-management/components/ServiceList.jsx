"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { BookingModal } from "./BookingModal"
import { toast } from "sonner"

export function ServiceList() {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedService, setSelectedService] = useState(null)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true)
                const res = await fetch("/api/client/services")
                if (!res.ok) throw new Error("Failed to fetch services")
                const data = await res.json()
                setServices(data)
            } catch (error) {
                toast.error("Failed to load services")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

    const handleBookNow = (service) => {
        setSelectedService(service)
        setIsBookingModalOpen(true)
    }

    if (loading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (services.length === 0) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center text-center space-y-2">
                <p className="text-xl font-medium">No services available</p>
                <p className="text-muted-foreground">Please check back later.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
                <Card key={service.id} className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative aspect-video w-full">
                        {service.image ? (
                            <Image
                                src={service.image}
                                alt={service.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <span className="text-muted-foreground">No Image</span>
                            </div>
                        )}
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <CardDescription className="line-clamp-2 min-h-[40px]">
                            {service.description || "No description provided."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-2xl font-bold text-primary">
                            ₱{service.price.toLocaleString()}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                        <Button className="w-full" onClick={() => handleBookNow(service)}>
                            Book Now
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            <BookingModal
                service={selectedService}
                open={isBookingModalOpen}
                setOpen={setIsBookingModalOpen}
                onBookingSuccess={() => {
                    // Do nothing for now, maybe redirect to service history?
                }}
            />
        </div>
    )
}
