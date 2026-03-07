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
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Check, Circle, X, User, ShieldCheck, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddUserModal({ onUserAdded }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "CLIENT",
    })

    const passwordRequirements = [
        { label: "8+ characters", regex: /.{8,}/ },
        { label: "One uppercase letter", regex: /[A-Z]/ },
        { label: "One lowercase letter", regex: /[a-z]/ },
        { label: "One number", regex: /[0-9]/ },
        { label: "One special character", regex: /[^A-Za-z0-9]/ },
    ]

    const getStrength = (password) => {
        if (!password) return 0
        let strength = 0
        passwordRequirements.forEach((req) => {
            if (req.regex.test(password)) strength += 20
        })
        return strength
    }

    const strength = getStrength(formData.password)
    const strengthColor = strength <= 40 ? "bg-red-500" : strength <= 80 ? "bg-yellow-500" : "bg-green-500"

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
            role: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            toast.error("Please fill in all required fields")
            return
        }

        if (strength < 100) {
            toast.error("Password does not meet all requirements")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        try {
            setIsSubmitting(true)
            // Remove confirmPassword from the data sent to API
            const { confirmPassword, ...submitData } = formData

            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to create user")
                return
            }

            toast.success("User created successfully!")
            onUserAdded(data)
            setOpen(false)
            setFormData({
                firstName: "",
                middleName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                phone: "",
                role: "CLIENT",
            })
            setShowPassword(false)
            setShowConfirmPassword(false)
        } catch (error) {
            toast.error("An error occurred while creating the user")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <User className="h-6 w-6 text-primary" />
                        Create New User
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">

                    {/* Personal Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded">01</span>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Personal Information</h3>
                            <Separator className="flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30 focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="middleName" className="text-sm font-medium text-muted-foreground">Middle Name (Optional)</Label>
                            <Input
                                id="middleName"
                                name="middleName"
                                placeholder="..."
                                value={formData.middleName}
                                onChange={handleInputChange}
                                className="bg-muted/10 border-dashed"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="09XXXXXXXXX"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    {/* Account & Security Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded">02</span>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account & Access</h3>
                            <Separator className="flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    Email Address *
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm font-medium flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Assign Role *
                                </Label>
                                <Select value={formData.role} onValueChange={handleSelectChange}>
                                    <SelectTrigger id="role" className="bg-muted/30">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CLIENT">Client</SelectItem>
                                        <SelectItem value="WORKER">Worker</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-dashed">
                            <div className="space-y-2">
                                <Label htmlFor="password" title="At least 8 characters with mixing uppercase, lowercase, numbers and symbols" className="text-sm font-medium flex items-center gap-1.5 cursor-help">
                                    <Lock className="h-3.5 w-3.5 text-primary" />
                                    Security Password *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-muted/30 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
                                    <div className="flex items-center justify-between text-[10px] mb-1">
                                        <span className="font-semibold uppercase text-muted-foreground tracking-tight">Password Security</span>
                                        <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                                            strength <= 40 ? "bg-red-100 text-red-700" :
                                                strength <= 80 ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-green-100 text-green-700")}>
                                            {strength <= 40 ? "WEAK" : strength <= 80 ? "MODERATE" : "STRONG"}
                                        </span>
                                    </div>
                                    <Progress value={strength} colorClass={strengthColor} className="h-1.5" />
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {passwordRequirements.map((req, i) => {
                                            const isMet = req.regex.test(formData.password)
                                            return (
                                                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                                                    {isMet ? (
                                                        <Check className="h-2.5 w-2.5 text-green-500 stroke-[3px]" />
                                                    ) : formData.password.length > 0 ? (
                                                        <X className="h-2.5 w-2.5 text-red-400 stroke-[3px]" />
                                                    ) : (
                                                        <Circle className="h-2.5 w-2.5 text-muted-foreground/40" />
                                                    )}
                                                    <span className={cn(
                                                        "transition-colors duration-200",
                                                        isMet ? "text-green-600 font-medium" : "text-muted-foreground"
                                                    )}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium">Verify Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className={cn(
                                            "bg-muted/30 pr-10",
                                            formData.confirmPassword && (formData.password === formData.confirmPassword ? "border-green-500/50 focus-visible:ring-green-500" : "border-red-500/50 focus-visible:ring-red-500")
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {formData.confirmPassword && (
                                    <p className={cn(
                                        "text-[10px] font-semibold flex items-center gap-1",
                                        formData.password === formData.confirmPassword ? "text-green-600" : "text-red-500"
                                    )}>
                                        {formData.password === formData.confirmPassword ? (
                                            <>
                                                <Check className="h-3 w-3" />
                                                Identification identities match
                                            </>
                                        ) : (
                                            <>
                                                <X className="h-3 w-3" />
                                                Passwords do not match
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>
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
                            disabled={isSubmitting || strength < 100 || formData.password !== formData.confirmPassword}
                            className="min-w-[120px] shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? "Processing..." : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
