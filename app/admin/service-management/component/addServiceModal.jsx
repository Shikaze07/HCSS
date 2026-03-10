"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Sparkles, AlignLeft, Banknote, Clock, PlusCircle, ImageIcon, Upload, X, Loader2 } from "lucide-react"

export function AddServiceModal({ onServiceAdded }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        duration: "60",
        image: ""
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)

        // Upload
        try {
            setIsUploading(true)
            const uploadData = new FormData()
            uploadData.append("file", file)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            })

            const data = await res.json()
            if (res.ok) {
                setFormData(prev => ({ ...prev, image: data.url }))
                toast.success("Image uploaded successfully")
            } else {
                toast.error(data.error || "Image upload failed")
            }
        } catch (error) {
            console.error("Image upload error:", error)
            toast.error("An error occurred during image upload")
        } finally {
            setIsUploading(false)
        }
    }

    const removeImage = () => {
        setImagePreview(null)
        setFormData(prev => ({ ...prev, image: "" }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.price) {
            toast.error("Please fill in required fields")
            return
        }

        try {
            setIsSubmitting(true)
            const res = await fetch("/api/admin/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to create service")
                return
            }

            toast.success("Service created successfully!")
            onServiceAdded(data)
            setOpen(false)
            setImagePreview(null)
            setFormData({
                name: "",
                description: "",
                price: "",
                duration: "60",
                image: ""
            })
        } catch (error) {
            toast.error("An error occurred while creating the service")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Service
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Add New Service
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
                            <Label htmlFor="name" className="text-sm font-medium">Service Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Premium House Cleaning"
                                value={formData.name || ""}
                                onChange={handleInputChange}
                                required
                                className="bg-muted/30 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1.5 focus-visible:ring-primary">
                                <AlignLeft className="h-3.5 w-3.5" />
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the inclusions and details of this service..."
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
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service Details</h3>
                            <Separator className="flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-sm font-medium flex items-center gap-1.5">
                                    <Banknote className="h-3.5 w-3.5" />
                                    Price (₱) *
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price || ""}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Duration (mins) *
                                </Label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    placeholder="60"
                                    value={formData.duration || ""}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30 focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Image Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded">03</span>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service Image</h3>
                            <Separator className="flex-1" />
                        </div>

                        <div className="space-y-4">
                            {imagePreview ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#e8e0d5]">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-[#e8e0d5] rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="p-4 bg-primary/5 rounded-full group-hover:scale-110 transition-transform mb-3">
                                                <Upload className="h-6 w-6 text-primary/70" />
                                            </div>
                                            <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">Click to upload image</p>
                                            <p className="text-xs text-muted-foreground mt-1 tracking-tight">SVG, PNG, JPG (max. 5MB)</p>
                                        </div>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            disabled={isUploading}
                                        />
                                    </Label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 justify-end bg-background sticky bottom-0 border-t mt-4 p-2 -mx-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting || isUploading}
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            className="min-w-[120px] shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? "Processing..." : "Save Service"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
