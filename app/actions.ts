"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export async function getUserRole() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // console.log("getUserRole - User ID:", user.id) // Commented out to reduce noise
    let profile = await db.profile.findUnique({
        where: { id: user.id }
    })
    // console.log("getUserRole - Profile found:", profile)

    // Self-healing: Create profile if it doesn't exist
    if (!profile) {
        const isAdminEmail = user.email === 'casayout.777@gmail.com'
        const newRole = isAdminEmail ? 'admin' : 'tecnico'

        console.log(`Creating missing profile for ${user.email} as ${newRole}`)

        try {
            profile = await db.profile.create({
                data: {
                    id: user.id,
                    role: newRole
                }
            })
        } catch (error) {
            console.error("Error creating profile:", error)
            // Fallback if concurrent creation happened or other error
            return 'tecnico'
        }
    }

    return profile?.role || 'tecnico'
}

// We'll reuse the schema or define a slightly looser one for the action if needed, 
// but receiving the raw data is fine.
const TicketSchema = z.object({
    clientName: z.string().min(2),
    clientPhone: z.string().min(6),
    clientEmail: z.string().email().optional().or(z.literal("")),
    productModel: z.string().min(2),
    category: z.string().min(2),
    faultDescription: z.string().min(5),
    location: z.enum(["LIBERTAD", "LARRAZABAL", "CORREO"]),
    // New Shipping Fields
    shippingProvince: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingAddress: z.string().optional(),
    shippingPostalCode: z.string().optional(),
    shippingNotes: z.string().optional(),
    // File Upload
    purchaseInvoiceUrl: z.string().optional(),
    attachments: z.array(z.string()).optional().default([]),
})

export async function createTicket(formData: z.infer<typeof TicketSchema>) {
    const validatedFields = TicketSchema.safeParse(formData)

    if (!validatedFields.success) {
        return { error: "Campos inválidos" }
    }

    const {
        clientName, clientPhone, clientEmail, productModel, category, faultDescription, location,
        shippingProvince, shippingCity, shippingAddress, shippingPostalCode, shippingNotes, purchaseInvoiceUrl: rawInvoiceUrl, attachments
    } = validatedFields.data

    console.log("createTicket received:", { clientName, rawInvoiceUrl, attachments }) // Debug

    const purchaseInvoiceUrl = rawInvoiceUrl === "" ? null : rawInvoiceUrl

    try {
        // 1. Get or Create a Default User (Simulation)
        const user = await db.user.upsert({
            where: { email: "demo@tecnico.com" },
            update: {},
            create: {
                email: "demo@tecnico.com",
                name: "Técnico Demo",
                role: "TECHNICIAN"
            }
        })

        // 2. Create Client and Ticket
        const newTicket = await db.repairTicket.create({
            data: {
                location,
                productModel,
                category,
                faultDescription,
                status: "INGRESADO",

                // Shipping Details
                shippingProvince,
                shippingCity,
                shippingAddress,
                shippingPostalCode,
                shippingNotes,

                purchaseInvoiceUrl, // Save URL to DB
                attachments: (attachments && attachments.length > 0)
                    ? attachments
                    : (purchaseInvoiceUrl ? [purchaseInvoiceUrl] : []),

                user: {
                    connect: { id: user.id }
                },
                client: {
                    create: {
                        fullName: clientName,
                        phone: clientPhone,
                        email: clientEmail || null
                    }
                }
            }
        })

        // Audit Log: CREATED
        await db.ticketLog.create({
            data: {
                ticketId: newTicket.id,
                userId: user.id,
                action: 'CREATED',
                details: 'Ticket ingresado al sistema'
            }
        })

        revalidatePath("/dashboard")
        return { success: true, ticketId: newTicket.id }

    } catch (error) {
        console.error("Error creating ticket:", error)
        return { error: "Error al guardar en base de datos" }
    }
}

const NotesSchema = z.object({
    ticketId: z.string().uuid(),
    notes: z.string()
})

export async function updateTicketNotes(formData: z.infer<typeof NotesSchema>) {
    const validated = NotesSchema.safeParse(formData)

    if (!validated.success) {
        return { error: "Datos inválidos" }
    }

    try {
        await db.repairTicket.update({
            where: { id: validated.data.ticketId },
            data: { internalNotes: validated.data.notes }
        })

        revalidatePath(`/tickets/${validated.data.ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating notes:", error)
        return { error: "Error al actualizar notas" }
    }
}

const StatusSchema = z.object({
    ticketId: z.string().uuid(),
    status: z.enum(["INGRESADO", "EN_REPARACION", "PARA_ENTREGAR", "ENTREGADO"])
})

export async function updateTicketStatus(formData: z.infer<typeof StatusSchema>) {
    const validated = StatusSchema.safeParse(formData)

    if (!validated.success) {
        return { error: "Estado inválido" }
    }

    try {
        // Need user ID for logging
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: "Usuario no autenticado" }

        await db.repairTicket.update({
            where: { id: validated.data.ticketId },
            data: { status: validated.data.status }
        })

        // Audit Log: STATUS_CHANGE or DELIVERED
        const action = validated.data.status === 'ENTREGADO' ? 'DELIVERED' : 'STATUS_CHANGE'
        const details = validated.data.status === 'ENTREGADO'
            ? 'Equipo entregado/retirado por cliente'
            : `Estado cambiado a ${validated.data.status}`

        // Safe logging - don't block if logging fails? Or maybe block. Let's block to ensure trace.
        await db.ticketLog.create({
            data: {
                ticketId: validated.data.ticketId,
                userId: user.id,
                action: action,
                details: details
            }
        })

        revalidatePath("/dashboard")
        revalidatePath("/egresos")
        revalidatePath(`/tickets/${validated.data.ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating status:", error)
        return { error: "Error al actualizar estado" }
    }
}

const EditTicketSchema = z.object({
    ticketId: z.string().uuid(),
    productModel: z.string().min(1, "Modelo requerido"),
    category: z.string().min(1, "Categoría requerida"),
    faultDescription: z.string().min(1, "Descripción requerida")
})

export async function updateTicketDetails(formData: z.infer<typeof EditTicketSchema>) {
    const validated = EditTicketSchema.safeParse(formData)

    if (!validated.success) {
        return { error: "Datos inválidos" }
    }

    try {
        const role = await getUserRole()
        if (role !== 'admin') return { error: "No tienes permisos para realizar esta acción" }

        await db.repairTicket.update({
            where: { id: validated.data.ticketId },
            data: {
                productModel: validated.data.productModel,
                category: validated.data.category,
                faultDescription: validated.data.faultDescription
            }
        })

        revalidatePath(`/tickets/${validated.data.ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating details:", error)
        return { error: "Error al actualizar detalles" }
    }
}

const EditClientSchema = z.object({
    clientId: z.string().uuid(),
    phone: z.string().min(1, "Teléfono requerido"),
    email: z.string().optional().nullable() // Allow empty/null
})

export async function updateClientDetails(formData: z.infer<typeof EditClientSchema>) {
    const validated = EditClientSchema.safeParse(formData)

    if (!validated.success) {
        return { error: "Datos de cliente inválidos" }
    }

    try {
        const role = await getUserRole()
        if (role !== 'admin') return { error: "No tienes permisos para realizar esta acción" }

        await db.client.update({
            where: { id: validated.data.clientId },
            data: {
                phone: validated.data.phone,
                email: validated.data.email || null
            }
        })

        revalidatePath("/tickets/[id]", "page") // Invalidate basic ticket pages
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error updating client:", error)
        return { error: "Error al actualizar cliente" }
    }
}

const EditShippingSchema = z.object({
    ticketId: z.string().uuid(),
    shippingProvince: z.string().nullable().optional(),
    shippingCity: z.string().nullable().optional(),
    shippingAddress: z.string().nullable().optional(),
    shippingPostalCode: z.string().nullable().optional(),
    shippingNotes: z.string().nullable().optional(),
})

export async function updateShippingDetails(formData: z.infer<typeof EditShippingSchema>) {
    const validated = EditShippingSchema.safeParse(formData)

    if (!validated.success) {
        return { error: "Datos de envío inválidos" }
    }

    try {
        const role = await getUserRole()
        if (role !== 'admin') return { error: "No tienes permisos para realizar esta acción" }

        await db.repairTicket.update({
            where: { id: validated.data.ticketId },
            data: {
                shippingProvince: validated.data.shippingProvince,
                shippingCity: validated.data.shippingCity,
                shippingAddress: validated.data.shippingAddress,
                shippingPostalCode: validated.data.shippingPostalCode,
                shippingNotes: validated.data.shippingNotes,
            }
        })

        revalidatePath(`/tickets/${validated.data.ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating shipping:", error)
        return { error: "Error al actualizar envío" }
    }
}

const UpdateInvoiceSchema = z.object({
    ticketId: z.string().uuid(),
    purchaseInvoiceUrl: z.string().nullable(),
})

export async function updateTicketInvoice(formData: z.infer<typeof UpdateInvoiceSchema>) {
    const validated = UpdateInvoiceSchema.safeParse(formData)

    if (!validated.success) {
        return { error: "Datos inválidos" }
    }

    try {
        const role = await getUserRole()
        if (role !== 'admin') return { error: "No tienes permisos para realizar esta acción" }

        await db.repairTicket.update({
            where: { id: validated.data.ticketId },
            data: { purchaseInvoiceUrl: validated.data.purchaseInvoiceUrl }
        })

        revalidatePath(`/tickets/${validated.data.ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating invoice:", error)
        return { error: "Error al actualizar factura" }
    }
}

const UpdateAttachmentsSchema = z.object({
    ticketId: z.string().uuid(),
    attachments: z.array(z.string()),
})

export async function updateTicketAttachments(formData: z.infer<typeof UpdateAttachmentsSchema>) {
    const validated = UpdateAttachmentsSchema.safeParse(formData)

    if (!validated.success) {
        return { error: "Datos inválidos" }
    }

    try {
        const role = await getUserRole()
        if (role !== 'admin') return { error: "No tienes permisos para realizar esta acción" }

        await db.repairTicket.update({
            where: { id: validated.data.ticketId },
            data: { attachments: validated.data.attachments }
        })

        revalidatePath(`/tickets/${validated.data.ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating attachments:", error)
        return { error: "Error al actualizar adjuntos" }
    }
}

const SearchClientSchema = z.object({
    query: z.string().min(1)
})

export async function searchClients(formData: z.infer<typeof SearchClientSchema>) {
    const validated = SearchClientSchema.safeParse(formData)

    if (!validated.success) return { error: "Búsqueda inválida" }

    const query = validated.data.query

    try {
        const clients = await db.client.findMany({
            where: {
                fullName: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            include: {
                tickets: true
            },
            take: 20
        })
        return { success: true, clients }
    } catch (error) {
        console.error("Error searching clients:", error)
        return { error: "Error al buscar clientes" }
    }
}

const SearchProductSchema = z.object({
    query: z.string().min(1)
})

export async function searchProducts(formData: z.infer<typeof SearchProductSchema>) {
    const validated = SearchProductSchema.safeParse(formData)

    if (!validated.success) return { error: "Búsqueda inválida" }

    const query = validated.data.query

    try {
        const tickets = await db.repairTicket.findMany({
            where: {
                OR: [
                    { productModel: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                client: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })
        return { success: true, tickets }
    } catch (error) {
        console.error("Error searching products:", error)
        return { error: "Error al buscar productos" }
    }
}

const DeleteTicketSchema = z.object({
    ticketId: z.string().uuid()
})

export async function deleteTicket(formData: z.infer<typeof DeleteTicketSchema>) {
    const validated = DeleteTicketSchema.safeParse(formData)

    if (!validated.success) return { error: "Ticket inválido" }

    try {
        const role = await getUserRole()
        if (role !== 'admin') return { error: "No tienes permisos para eliminar tickets" }

        await db.repairTicket.delete({
            where: { id: validated.data.ticketId }
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error deleting ticket:", error)
        return { error: "Error al eliminar el ticket" }
    }
}
