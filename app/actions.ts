"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

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
  shippingPostalCode: z.string().optional(),
  shippingNotes: z.string().optional(),
  // File Upload
  purchaseInvoiceUrl: z.string().optional(),
})

export async function createTicket(formData: z.infer<typeof TicketSchema>) {
  const validatedFields = TicketSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { error: "Campos inválidos" }
  }

  const { 
    clientName, clientPhone, clientEmail, productModel, category, faultDescription, location,
    shippingProvince, shippingCity, shippingAddress, shippingPostalCode, shippingNotes, purchaseInvoiceUrl
  } = validatedFields.data

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
        shippingPostalCode,
        shippingNotes,
        
        purchaseInvoiceUrl, // Save URL to DB

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
        await db.repairTicket.update({
            where: { id: validated.data.ticketId },
            data: { status: validated.data.status }
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
