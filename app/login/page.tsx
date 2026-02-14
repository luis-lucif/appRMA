'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface LoginState {
    error: string
    fieldErrors?: {
        email?: string[]
        password?: string[]
    }
}

const initialState: LoginState = {
    error: '',
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="flex items-center justify-center min-h-screen bg-black px-4 overflow-hidden relative selection:bg-[#FF00FF] selection:text-white">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF5F1F] rounded-full blur-[120px] opacity-10 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF00FF] rounded-full blur-[120px] opacity-10 animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Neon Card Container */}
                <div className="neon-border-flow p-[1px] rounded-xl bg-transparent">
                    <Card className="w-full bg-black/90 backdrop-blur-xl border-none shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 h-full">
                        <CardHeader className="space-y-2 text-center pb-8 pt-10">
                            <div className="mx-auto mb-6 relative group cursor-default flex justify-center">
                                {/* Logo NOGA - SVG Implementation */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#FF5F1F] blur-[40px] opacity-20 animate-pulse rounded-full"></div>
                                    <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-[0_0_15px_rgba(255,95,31,0.5)]">
                                        <defs>
                                            <linearGradient id="noga-gradient" x1="0" y1="0" x2="100%" y2="0">
                                                <stop offset="0%" stopColor="#FF5F1F" />
                                                <stop offset="50%" stopColor="#FFFFFF" />
                                                <stop offset="100%" stopColor="#FF00FF" />
                                            </linearGradient>
                                        </defs>
                                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="48" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.1em" fill="url(#noga-gradient)">
                                            NOGA
                                        </text>
                                    </svg>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-[#FF5F1F] to-[#FF00FF] rounded-full shadow-[0_0_15px_rgba(255,95,31,0.8)]"></div>
                                </div>
                            </div>
                            <CardTitle className="text-sm font-medium text-gray-500 tracking-[0.2em] uppercase">Sistema de Gestión de Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-10">
                            <form action={formAction} className="space-y-6">
                                <div className="space-y-2 group">
                                    <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-widest group-focus-within:text-[#FF5F1F] transition-colors duration-300">Usuario / Email</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Ingresa tu usuario"
                                            required
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-700 h-12 pl-4 focus:bg-black focus:border-[#FF5F1F] focus:ring-0 transition-all duration-300 rounded-lg"
                                        />
                                        <div className="absolute inset-0 rounded-lg pointer-events-none border border-transparent group-focus-within:border-[#FF5F1F]/50 group-focus-within:shadow-[0_0_15px_rgba(255,95,31,0.2)] transition-all duration-300"></div>
                                    </div>
                                    {state?.fieldErrors?.email && (
                                        <p className="text-xs text-red-500 font-bold uppercase tracking-wide">{state.fieldErrors.email[0]}</p>
                                    )}
                                </div>
                                <div className="space-y-2 group">
                                    <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-widest group-focus-within:text-[#FF00FF] transition-colors duration-300">Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-700 h-12 pl-4 focus:bg-black focus:border-[#FF00FF] focus:ring-0 transition-all duration-300 rounded-lg"
                                        />
                                        <div className="absolute inset-0 rounded-lg pointer-events-none border border-transparent group-focus-within:border-[#FF00FF]/50 group-focus-within:shadow-[0_0_15px_rgba(255,0,255,0.2)] transition-all duration-300"></div>
                                    </div>
                                    {state?.fieldErrors?.password && (
                                        <p className="text-xs text-red-500 font-bold uppercase tracking-wide">{state.fieldErrors.password[0]}</p>
                                    )}
                                </div>

                                <div className="text-right">
                                    <a href="#" className="text-xs text-gray-600 hover:text-white transition-colors">¿Olvidaste tu contraseña?</a>
                                </div>

                                {state?.error && (
                                    <div className="flex items-center gap-3 p-4 text-sm text-[#FF5F1F] bg-[#FF5F1F]/5 border border-[#FF5F1F]/20 rounded-lg shadow-[inset_0_0_10px_rgba(255,95,31,0.1)]">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p className="font-medium">{state.error}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-gradient-to-r from-[#FF5F1F] to-[#FF00FF] text-white font-black text-lg tracking-wide rounded-full shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_40px_rgba(255,0,255,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-none mt-6 relative overflow-hidden group/btn"
                                    disabled={isPending}
                                >
                                    <span className="relative z-10">{isPending ? "AUTENTICANDO..." : "ACCESO AL SISTEMA"}</span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                </Button>

                                <div className="text-center mt-8">
                                    <p className="text-xs text-gray-700">¿No tienes cuenta?</p>
                                    <a href="#" className="text-xs text-gray-500 hover:text-[#FF5F1F] transition-colors uppercase tracking-widest font-bold mt-1 inline-block">Solicitar Acceso</a>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
