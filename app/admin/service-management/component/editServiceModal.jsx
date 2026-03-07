"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Sparkles, AlignLeft, Banknote, Clock, Settings2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function EditServiceModal({ service, open, setOpen, onServiceUpdated }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        status: "ACTIVE",
    })

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name || "",
                description: service.description || "",
                price: service.price?.toString() || "",
                duration: service.duration?.toString() || "60",
                status: service.status ? "ACTIVE" : "INACTIVE",
            })
        }
    }, [service])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSelectChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            status: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.price) {
            toast.error("Please fill in required fields")
            return
        }

        try {
            setIsSubmitting(true)
            const res = await fetch(`/api/admin/services/${service.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to update service")
                return
            }

            toast.success("Service updated successfully!")
            onServiceUpdated(data)
            setOpen(false)
        } catch (error) {
            toast.error("An error occurred while updating the service")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Settings2 className="h-6 w-6 text-primary" />
                        Edit Service
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">

                    {/* General Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded">01</span>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">General Information</h3>
                            <Separator className="flex-1" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-service-name" className="text-sm font-medium">Service Name *</Label>
                            <Input
                                id="edit-service-name"
                                name="name"
                                value={formData.name || ""}
                                onChange={handleInputChange}
                                required
                                className="bg-muted/30 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-service-description" className="text-sm font-medium flex items-center gap-1.5 focus-visible:ring-primary">
                                <AlignLeft className="h-3.5 w-3.5" />
                                Description
                            </Label>
                            <Textarea
                                id="edit-service-description"
                                name="description"
                                value={formData.description || ""}
                                onChange={handleInputChange}
                                rows={3}
                                className="bg-muted/30 resize-none focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Service Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded">02</span>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service Details & Status</h3>
                            <Separator className="flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-service-price" className="text-sm font-medium flex items-center gap-1.5">
                                    <Banknote className="h-3.5 w-3.5" />
                                    Price (₱) *
                                </Label>
                                <Input
                                    id="edit-service-price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price || ""}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-service-duration" className="text-sm font-medium flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Duration (mins) *
                                </Label>
                                <Input
                                    id="edit-service-duration"
                                    name="duration"
                                    type="number"
                                    value={formData.duration || ""}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label htmlFor="edit-service-status" className="text-sm font-medium flex items-center gap-1.5">
                                {formData.status === "ACTIVE" ?
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> :
                                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                }
                                Service Status *
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={handleSelectChange}
                            >
                                <SelectTrigger id="edit-service-status" className={cn(
                                    "bg-muted/30",
                                    formData.status === "ACTIVE" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                                )}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE" className="text-green-600 font-medium">Active</SelectItem>
                                    <SelectItem value="INACTIVE" className="text-red-600 font-medium">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 justify-end bg-background sticky bottom-0 border-t mt-4 p-2 -mx-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[140px] shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? "Updating..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
