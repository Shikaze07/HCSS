"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { MapPin, Loader2 } from "lucide-react"

export function BookingModal({ service, open, setOpen, onBookingSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [formData, setFormData] = useState({
        bookingDate: "",
        startTime: "",
        duration: service?.duration || 60,
        address: "",
        latitude: null,
        longitude: null,
        clientId: "", // Start with empty, will be filled from session
    })

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await fetch("/api/auth/me")
                const data = await res.json()
                if (res.ok && data.user) {
                    setFormData(prev => ({ ...prev, clientId: data.user.id }))
                }
            } catch (error) {
                console.error("Error fetching current user for booking:", error)
            }
        }

        if (open) {
            fetchCurrentUser()
        }
    }, [open])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePinLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setFormData(prev => ({ ...prev, latitude, longitude }))

                try {
                    // Reverse geocoding using OpenStreetMap Nominatim (free, no key required for low volume)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    const data = await response.json()

                    if (data && data.display_name) {
                        setFormData(prev => ({ ...prev, address: data.display_name }))
                        toast.success("Location pinned successfully!")
                    }
                } catch (error) {
                    console.error("Reverse geocoding error:", error)
                    toast.info(`Pinned at: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Please verify the address manually.`)
                } finally {
                    setIsLocating(false)
                }
            },
            (error) => {
                setIsLocating(false)
                toast.error("Unable to retrieve your location. Please check your permissions.")
                console.error("Geolocation error:", error)
            }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.bookingDate || !formData.startTime || !formData.duration || !formData.address) {
            toast.error("Please fill in all fields")
            return
        }

        if (!formData.clientId) {
            toast.error("Session error. Please try logging in again.")
            return
        }

        try {
            setIsSubmitting(true)

            // Construct full ISO strings for startTime and calculate endTime
            const startDateTime = new Date(`${formData.bookingDate}T${formData.startTime}`)
            const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60000)

            const res = await fetch("/api/client/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    serviceId: service.id,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to create booking")
                return
            }

            toast.success("Booking created successfully!")
            onBookingSuccess(data)
            setOpen(false)
            setFormData(prev => ({
                bookingDate: "",
                startTime: "",
                duration: service?.duration || 60,
                address: "",
                latitude: null,
                longitude: null,
                clientId: prev.clientId, // Keep the same clientId
            }))
        } catch (error) {
            toast.error("An error occurred while booking")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Book {service?.name}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to schedule your cleaning service.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bookingDate">Date</Label>
                            <Input
                                id="bookingDate"
                                name="bookingDate"
                                type="date"
                                value={formData.bookingDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <div className="h-10 flex items-center px-3 rounded-md border bg-muted/50 font-medium text-primary">
                                ₱{service?.price?.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (mins)</Label>
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                readOnly
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="address">Service Address</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={handlePinLocation}
                                disabled={isLocating}
                            >
                                {isLocating ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <MapPin className="h-3 w-3" />
                                )}
                                {isLocating ? "Locating..." : "Pin Location"}
                            </Button>
                        </div>
                        <Textarea
                            id="address"
                            name="address"
                            placeholder="Enter your full address here..."
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            rows={3}
                        />
                        {formData.latitude && (
                            <p className="text-[10px] text-muted-foreground">
                                Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Booking..." : "Confirm Booking"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
