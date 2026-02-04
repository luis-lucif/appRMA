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
        <div className="flex items-center justify-center min-h-screen bg-black px-4">
            <Card className="w-full max-w-md bg-gray-900/90 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)] backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center text-white tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Login</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Ingresa tus credenciales para acceder al sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                required
                                className={`bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/50 focus:shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all duration-300 ${state?.fieldErrors?.email ? "border-red-500" : ""}`}
                            />
                            {state?.fieldErrors?.email && (
                                <p className="text-sm text-red-500">{state.fieldErrors.email[0]}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`bg-gray-800 border-gray-700 text-white focus:border-orange-500 focus:ring-orange-500/50 focus:shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all duration-300 ${state?.fieldErrors?.password ? "border-red-500" : ""}`}
                            />
                            {state?.fieldErrors?.password && (
                                <p className="text-sm text-red-500">{state.fieldErrors.password[0]}</p>
                            )}
                        </div>

                        {state?.error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-md">
                                <AlertCircle className="w-4 h-4" />
                                <p>{state.error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.7)] transition-all duration-300 border-none"
                            disabled={isPending}
                        >
                            {isPending ? "Ingresando..." : "Log In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
