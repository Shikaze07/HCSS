"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Check, Circle, X, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomerSignUpModalProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
    onSuccess?: (user: any) => void
    onSwitchToLogin?: () => void
}

export function CustomerSignUpModal({
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    trigger,
    onSuccess,
    onSwitchToLogin,
}: CustomerSignUpModalProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen
    const setOpen = isControlled ? (controlledOnOpenChange || (() => { })) : setUncontrolledOpen

    const router = useRouter()
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
    })

    const passwordRequirements = [
        { label: "8+ characters", regex: /.{8,}/ },
        { label: "One uppercase letter", regex: /[A-Z]/ },
        { label: "One lowercase letter", regex: /[a-z]/ },
        { label: "One number", regex: /[0-9]/ },
        { label: "One special character", regex: /[^A-Za-z0-9]/ },
    ]

    const getStrength = (password: string) => {
        if (!password) return 0
        let strength = 0
        passwordRequirements.forEach((req) => {
            if (req.regex.test(password)) strength += 20
        })
        return strength
    }

    const strength = getStrength(formData.password)
    const strengthColor = strength <= 40 ? "bg-red-500" : strength <= 80 ? "bg-yellow-500" : "bg-green-500"

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            toast.error("Please fill in all required fields")
            return
        }

        if (strength < 100) {
            toast.error("Password does not meet all security requirements")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        try {
            setIsSubmitting(true)
            const { confirmPassword, ...submitData } = formData

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to create account")
                return
            }

            toast.success("Account created! Redirecting to booking...")
            setOpen(false)
            setFormData({
                firstName: "",
                middleName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                phone: "",
            })
            setShowPassword(false)
            setShowConfirmPassword(false)

            if (onSuccess) {
                onSuccess(data.user)
            }

            // Immediately redirect to booking management
            router.push("/client/booking-management")
            router.refresh()
        } catch (error) {
            toast.error("An error occurred during registration. Please try again.")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-xl border-[#e8e0d5] bg-white">
                <DialogHeader className="p-6 pb-2 border-b border-[#f0ebe4] bg-[#faf8f5]">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2.5 text-[#2c1810]">
                            <Image src="/logohcss.png" alt="HCSS Logo" width={32} height={32} className="object-contain" />
                            Sign Up to Book
                        </DialogTitle>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                            Customer Account
                        </span>
                    </div>
                    <DialogDescription className="text-xs text-[#8a7060] pt-1">
                        Create your customer profile to schedule, customize, and track your home cleanings.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* Personal Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded">01</span>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8a7060]">Personal Information</h3>
                            <Separator className="flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-firstName" className="text-sm font-medium text-[#2c1810]">First Name *</Label>
                                <Input
                                    id="signup-firstName"
                                    name="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30 focus-visible:ring-amber-600 rounded-none border-[#e8e0d5]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-lastName" className="text-sm font-medium text-[#2c1810]">Last Name *</Label>
                                <Input
                                    id="signup-lastName"
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-muted/30 focus-visible:ring-amber-600 rounded-none border-[#e8e0d5]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="signup-middleName" className="text-sm font-medium text-muted-foreground">Middle Name (Optional)</Label>
                            <Input
                                id="signup-middleName"
                                name="middleName"
                                placeholder="..."
                                value={formData.middleName}
                                onChange={handleInputChange}
                                className="bg-muted/10 border-dashed rounded-none border-[#e8e0d5]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="signup-phone" className="text-sm font-medium flex items-center gap-1.5 text-[#2c1810]">
                                <Phone className="h-3.5 w-3.5 text-amber-600" />
                                Phone Number
                            </Label>
                            <Input
                                id="signup-phone"
                                name="phone"
                                placeholder="09XXXXXXXXX"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="bg-muted/30 rounded-none border-[#e8e0d5]"
                            />
                        </div>
                    </div>

                    {/* Account & Security Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded">02</span>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8a7060]">Account & Security</h3>
                            <Separator className="flex-1" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-sm font-medium flex items-center gap-1.5 text-[#2c1810]">
                                <Mail className="h-3.5 w-3.5 text-amber-600" />
                                Email Address *
                            </Label>
                            <Input
                                id="signup-email"
                                name="email"
                                type="email"
                                placeholder="customer@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="bg-muted/30 rounded-none border-[#e8e0d5]"
                            />
                        </div>

                        <div className="space-y-4 pt-2 border-t border-dashed border-[#e8e0d5]">
                            <div className="space-y-2">
                                <Label htmlFor="signup-password" title="At least 8 characters with uppercase, lowercase, numbers and symbols" className="text-sm font-medium flex items-center gap-1.5 cursor-help text-[#2c1810]">
                                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                                    Security Password *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="signup-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-muted/30 pr-10 rounded-none border-[#e8e0d5]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-amber-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <div className="space-y-3 p-3 bg-[#faf8f5] rounded-lg border border-[#e8e0d5]">
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
                                <Label htmlFor="signup-confirmPassword" className="text-sm font-medium text-[#2c1810]">Verify Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="signup-confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className={cn(
                                            "bg-muted/30 pr-10 rounded-none border-[#e8e0d5]",
                                            formData.confirmPassword && (formData.password === formData.confirmPassword ? "border-green-500/50 focus-visible:ring-green-500" : "border-red-500/50 focus-visible:ring-red-500")
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-amber-600 transition-colors"
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

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#f0ebe4] bg-white sticky bottom-0">
                        <div className="text-xs text-muted-foreground">
                            Already have an account?{" "}
                            {onSwitchToLogin ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false)
                                        onSwitchToLogin()
                                    }}
                                    className="font-bold text-amber-700 hover:text-amber-800 hover:underline transition-colors cursor-pointer"
                                >
                                    Log In
                                </button>
                            ) : (
                                <Link href="/login" onClick={() => setOpen(false)} className="font-semibold text-amber-700 hover:underline">
                                    Log In
                                </Link>
                            )}
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                                className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-none"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || strength < 100 || formData.password !== formData.confirmPassword}
                                className="bg-[#2c1810] text-[#faf8f5] hover:bg-amber-700 transition-all rounded-none min-w-[140px] font-bold tracking-wider text-xs uppercase"
                            >
                                {isSubmitting ? "Creating..." : "Sign Up & Book"}
                                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
