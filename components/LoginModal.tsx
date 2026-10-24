"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"

interface LoginModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSwitchToSignUp?: () => void
    onSuccess?: (user: any) => void
}

export function LoginModal({
    open,
    onOpenChange,
    onSwitchToSignUp,
    onSuccess,
}: LoginModalProps) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim() || !password) {
            toast.error("Please enter both email and password")
            return
        }

        try {
            setIsLoading(true)

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || "Invalid credentials")
                return
            }

            toast.success(`Welcome back, ${data.user.firstName || "User"}!`)
            onOpenChange(false)
            setEmail("")
            setPassword("")
            setShowPassword(false)

            if (onSuccess) {
                onSuccess(data.user)
            }

            // Route based on role
            const role = data.user.role
            if (role === "ADMIN") {
                router.push("/admin/dashboard")
            } else if (role === "CLIENT") {
                router.push("/client/booking-management")
            } else if (role === "WORKER") {
                router.push("/worker/dashboard")
            } else {
                router.push("/")
            }

            router.refresh()
        } catch (error) {
            console.error("Login error:", error)
            toast.error("An error occurred during login. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-xl border-[#e8e0d5] dark:border-[#38261d] bg-white dark:bg-[#1a130f] text-[#2c1810] dark:text-[#faf0e6]">
                <DialogHeader className="p-6 pb-4 border-b border-[#f0ebe4] dark:border-[#2e1f18] bg-[#faf8f5] dark:bg-[#150e0b] text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#251b16] border border-[#e8e0d5] dark:border-[#38261d] p-2 flex items-center justify-center shadow-sm mb-2">
                        <Image
                            src="/logohcss.png"
                            alt="HCSS Logo"
                            width={42}
                            height={42}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-[#2c1810] dark:text-[#faf0e6]">
                        Welcome Back
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#8a7060] dark:text-[#b89e90]">
                        Enter your credentials to access your HCSS account
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-[#2c1810] dark:text-[#e8d5c4] flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            Email Address
                        </Label>
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="rounded-none border-[#e8e0d5] dark:border-[#38261d] bg-muted/20 dark:bg-[#251b16] text-[#2c1810] dark:text-[#faf0e6] dark:placeholder:text-[#8a7060] focus-visible:ring-amber-600 h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-[#2c1810] dark:text-[#e8d5c4] flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="rounded-none border-[#e8e0d5] dark:border-[#38261d] bg-muted/20 dark:bg-[#251b16] text-[#2c1810] dark:text-[#faf0e6] dark:placeholder:text-[#8a7060] pr-10 focus-visible:ring-amber-600 h-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2c1810] hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-[#faf8f5] dark:text-white font-bold tracking-widest text-xs uppercase h-11 rounded-none shadow-md transition-all duration-300"
                        >
                            {isLoading ? "Logging in..." : "Log In"}
                            <ArrowRight className="h-3.5 w-3.5 ml-2" />
                        </Button>
                    </div>

                    <div className="text-center pt-3 border-t border-[#f0ebe4] dark:border-[#2e1f18] text-xs text-[#8a7060] dark:text-[#b89e90]">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={() => {
                                onOpenChange(false)
                                if (onSwitchToSignUp) {
                                    onSwitchToSignUp()
                                }
                            }}
                            className="font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                        >
                            Sign Up to Book
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
