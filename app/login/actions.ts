'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const validatedFields = loginSchema.safeParse({
        email,
        password,
    })

    if (!validatedFields.success) {
        return {
            error: "Datos inválidos",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error("Login Error:", error.message)
        return {
            error: error.message,
        }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
