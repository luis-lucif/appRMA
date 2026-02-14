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

        <Card className="col-span-3 lg:col-span-2 h-full flex flex-col overflow-hidden shadow-none border border-white/10 bg-black/50 backdrop-blur-md min-h-0 hover:border-white/10 hover:shadow-none hover:bg-black/50 transition-none">
          <CardHeader className="flex-none pb-4">
            <CardTitle className="text-[#FF5F1F] tracking-wider uppercase text-sm">Reparaciones</CardTitle>
            <CardDescription className="text-gray-500">
              {date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : "Selecciona una fecha"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 pt-0" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
            <div className="flex flex-col gap-4">
              {filteredTickets.length === 0 ? (
                <div className="text-center text-gray-600 py-12 text-sm italic">
                  No hay ingresos registrados para este día.
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block group/item relative">
                    {/* Neon Border Container */}
                    <div className="neon-border-flow p-[1px] rounded-lg bg-transparent transition-all duration-300">
                        <div className="flex flex-col gap-2 rounded-lg bg-[#0a0a0a] p-4 group-hover/item:bg-black transition-colors cursor-pointer text-white shadow-lg relative z-10 h-full border border-white/5 group-hover/item:border-transparent">
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center justify-between">
                                <div className="font-bold text-sm truncate pr-2 text-white group-hover/item:text-[#FF5F1F] transition-colors duration-300">{ticket.productModel}</div>
                                <span className="text-[10px] uppercase tracking-wider text-gray-600 group-hover/item:text-white transition-colors duration-300">{format(new Date(ticket.createdAt), "HH:mm")}</span>
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest ${ticket.status === 'INGRESADO' ? 'text-green-500' :
                                    ticket.status === 'EN_REPARACION' ? 'text-yellow-500' :
                                    ticket.status === 'PARA_ENTREGAR' ? 'text-blue-500' :
                                        ticket.status === 'ENTREGADO' ? 'text-red-500' : 'text-gray-600'
                                }`}>
                                {ticket.status === 'PARA_ENTREGAR' ? 'PARA ENTREGAR' :
                                    ticket.status === 'ENTREGADO' ? 'RETIRADO' :
                                    ticket.status.replace('_', ' ')}
                                </div>
                            </div>
                            <div className="line-clamp-2 text-xs text-gray-400 group-hover/item:text-gray-300 transition-colors duration-300 font-light">
                                {ticket.faultDescription}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 border-t border-dashed border-white/10 pt-2 group-hover/item:border-[#FF00FF]/20 transition-colors duration-300">
                                <span className="font-medium truncate text-gray-500 group-hover/item:text-white transition-colors duration-300">{ticket.client.fullName}</span>
                            </div>
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
