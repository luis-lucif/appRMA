"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { RepairTicket, Client } from "@prisma/client"
import Link from "next/link"

type TicketWithClient = RepairTicket & { client: Client }

interface DashboardViewProps {
  tickets: TicketWithClient[]
}

export function DashboardView({ tickets }: DashboardViewProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const filteredTickets = React.useMemo(() => {
    if (!date) return []
    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt)
      return (
        ticketDate.getDate() === date.getDate() &&
        ticketDate.getMonth() === date.getMonth() &&
        ticketDate.getFullYear() === date.getFullYear()
      )
    })
  }, [date, tickets])

  // Calculate height: 100vh - header(~4rem) - main padding(~2rem) - gap(~1rem) = ~7rem offset
  // We use 12rem to be definitely safe and ensure no body scroll
  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-12rem)] overflow-hidden">
      <div className="grid gap-4 md:grid-cols-7 h-full min-h-0">
        <Card className="col-span-4 lg:col-span-5 h-full flex flex-col overflow-hidden shadow-md">
          <CardHeader className="flex-none">
            <CardTitle>Calendario de Ingresos</CardTitle>
            <CardDescription>Selecciona un día para ver los detalles.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center items-start p-6 overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow p-6 w-full max-w-2xl h-fit scale-100 xl:scale-110 origin-top"
            />
          </CardContent>
        </Card>

        <Card className="col-span-3 lg:col-span-2 h-full flex flex-col overflow-hidden shadow-md min-h-0">
          <CardHeader className="flex-none">
            <CardTitle>Reparaciones</CardTitle>
            <CardDescription>
              {date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : "Selecciona una fecha"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 pt-0" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
            <div className="flex flex-col gap-3">
              {filteredTickets.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No hay ingresos este día.
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block">
                    <div className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer bg-card text-card-foreground shadow-sm">
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm truncate pr-2">{ticket.productModel}</div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(ticket.createdAt), "HH:mm")}</span>
                        </div>
                        <div className={`text-xs font-bold ${ticket.status === 'INGRESADO' ? 'text-green-500' :
                            ticket.status === 'EN_REPARACION' ? 'text-yellow-500' :
                              ticket.status === 'PARA_ENTREGAR' ? 'text-blue-500' :
                                ticket.status === 'ENTREGADO' ? 'text-red-500' : 'text-gray-400'
                          }`}>
                          {ticket.status === 'PARA_ENTREGAR' ? 'PARA ENTREGAR' :
                            ticket.status === 'ENTREGADO' ? 'RETIRADO' :
                              ticket.status.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {ticket.faultDescription}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 border-t pt-2">
                        <span className="font-medium truncate">{ticket.client.fullName}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
