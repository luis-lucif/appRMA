import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

import { TicketDeliveryButton } from "@/components/ticket-delivery-button"

import { redirect } from "next/navigation"
import { getUserRole } from "@/app/actions"

export default async function EgresosPage() {
    const role = await getUserRole()
    if (role !== 'admin') redirect('/dashboard')

    // Fetch tickets that are Finished (PARA_ENTREGAR) or Delivered (ENTREGADO)
    const tickets = await db.repairTicket.findMany({
        where: {
            status: {
                in: ["PARA_ENTREGAR", "ENTREGADO"]
            }
        },
        include: {
            client: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Egresos y Retiros</h1>
                    <p className="text-muted-foreground">Gestión de equipos listos para entregar o ya retirados.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tickets.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No hay equipos listos para retirar ni entregas recientes.
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket.id} className="neon-border-flow p-[1px] rounded-lg bg-transparent transition-all duration-300 group/item relative">
                            <div className={`flex flex-col h-full rounded-lg bg-[#0a0a0a] group-hover/item:bg-black transition-colors border border-white/5 group-hover/item:border-transparent relative z-10 border-l-4 ${ticket.status === 'PARA_ENTREGAR' ? 'border-l-blue-600' : 'border-l-red-600 opacity-80'}`}>
                                <Link href={`/tickets/${ticket.id}`} className="flex-1 transition-colors cursor-pointer">
                                    <div className="p-6 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-lg group-hover/item:text-[#FF5F1F] transition-colors duration-300">
                                                    {ticket.productModel}
                                                </div>
                                                <div className="text-sm text-muted-foreground group-hover/item:text-gray-400 transition-colors">
                                                    {ticket.client.fullName}
                                                </div>
                                            </div>
                                            <Badge className={ticket.status === 'PARA_ENTREGAR' ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}>
                                                {ticket.status === 'PARA_ENTREGAR' ? "Para Entregar" : "Retirado"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-6 pt-2">
                                        <div className="text-sm text-muted-foreground mb-2 group-hover/item:text-gray-300 transition-colors">
                                            <span className="font-semibold">Falla:</span> {ticket.faultDescription}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2 group-hover/item:text-white transition-colors">
                                            <span>Actualizado: {format(new Date(ticket.updatedAt), "d MMM HH:mm", { locale: es })}</span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Action Area */}
                                {ticket.status === 'PARA_ENTREGAR' && (
                                    <div className="p-4 pt-0 flex justify-end">
                                        <TicketDeliveryButton ticketId={ticket.id} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
