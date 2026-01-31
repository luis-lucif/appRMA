import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

import { TicketDeliveryButton } from "@/components/ticket-delivery-button"

export default async function EgresosPage() {
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
                <Card key={ticket.id} className={`transition-colors border-l-4 ${ticket.status === 'PARA_ENTREGAR' ? 'border-l-green-500' : 'border-l-red-500 opacity-80'}`}>
                    <div className="flex flex-col h-full">
                        <Link href={`/tickets/${ticket.id}`} className="flex-1 hover:bg-muted/50 transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                         <CardTitle className="text-lg">{ticket.productModel}</CardTitle>
                                         <CardDescription>{ticket.client.fullName}</CardDescription>
                                    </div>
                                    <Badge variant={ticket.status === 'ENTREGADO' ? "destructive" : "default"} className={ticket.status === 'PARA_ENTREGAR' ? "bg-green-600" : ""}>
                                        {ticket.status === 'PARA_ENTREGAR' ? "En espera de Retiro" : "Retirado"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mb-2">
                                    <span className="font-semibold">Falla:</span> {ticket.faultDescription}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    <span>Actualizado: {format(new Date(ticket.updatedAt), "d MMM HH:mm", { locale: es })}</span>
                                </div>
                            </CardContent>
                        </Link>
                        
                        {/* Action Area */}
                        {ticket.status === 'PARA_ENTREGAR' && (
                            <div className="p-4 pt-0 flex justify-end">
                                <TicketDeliveryButton ticketId={ticket.id} />
                            </div>
                        )}
                    </div>
                </Card>
            ))
        )}
      </div>
    </div>
  )
}
