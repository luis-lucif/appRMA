'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

const initialState = {
    error: '',
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tus credenciales para acceder al sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                required
                                className={state?.fieldErrors?.email ? "border-red-500" : ""}
                            />
                            {state?.fieldErrors?.email && (
                                <p className="text-sm text-red-500">{state.fieldErrors.email[0]}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={state?.fieldErrors?.password ? "border-red-500" : ""}
                            />
                            {state?.fieldErrors?.password && (
                                <p className="text-sm text-red-500">{state.fieldErrors.password[0]}</p>
                            )}
                        </div>

                        {state?.error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">
                                <AlertCircle className="w-4 h-4" />
                                <p>{state.error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Ingresando..." : "Ingresar"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
