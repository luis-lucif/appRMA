"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateTicketStatus } from "@/app/actions"
import { useTransition } from "react"
import { Badge } from "@/components/ui/badge"

interface TicketStatusSelectProps {
  ticketId: string
  currentStatus: "INGRESADO" | "EN_REPARACION" | "PARA_ENTREGAR" | "ENTREGADO"
}

export function TicketStatusSelect({ ticketId, currentStatus }: TicketStatusSelectProps) {
  const [isPending, startTransition] = useTransition()
  
  const statusLabels = {
    INGRESADO: "Ingresado",
    EN_REPARACION: "En Reparación",
    PARA_ENTREGAR: "Terminado (A Egresos)", // User asked for "Terminado"
  }

  const handleStatusChange = (value: string) => {
    startTransition(async () => {
        // cast value because we know the options
        await updateTicketStatus({ 
            ticketId, 
            status: value as "INGRESADO" | "EN_REPARACION" | "PARA_ENTREGAR" | "ENTREGADO" 
        })
    })
  }

  // Determine color based on status (visual feedback in trigger)
  const statusColors = {
    INGRESADO: "bg-green-600",
    EN_REPARACION: "bg-yellow-500",
    PARA_ENTREGAR: "bg-blue-600",
    ENTREGADO: "bg-red-600",
  }

  return (
    <Select onValueChange={handleStatusChange} defaultValue={currentStatus} disabled={isPending}>
      <SelectTrigger className={`w-[200px] text-white font-medium ${statusColors[currentStatus] || "bg-slate-500"} border-none`}>
        <SelectValue placeholder="Estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="INGRESADO">Ingresado</SelectItem>
        <SelectItem value="EN_REPARACION">En Reparación</SelectItem>
        <SelectItem value="PARA_ENTREGAR">Terminado</SelectItem>
        {currentStatus === "ENTREGADO" && (
            <SelectItem value="ENTREGADO">Retirado / Entregado</SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
