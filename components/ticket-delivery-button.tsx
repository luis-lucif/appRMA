"use client"

import { Button } from "@/components/ui/button"
import { updateTicketStatus } from "@/app/actions"
import { useTransition } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"

interface TicketDeliveryButtonProps {
  ticketId: string
}

export function TicketDeliveryButton({ ticketId }: TicketDeliveryButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelivery = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if inside a link (though we will separate it)
    e.stopPropagation()
    
    startTransition(async () => {
        await updateTicketStatus({ 
            ticketId, 
            status: "ENTREGADO" 
        })
    })
  }

  return (
    <Button 
        variant="destructive" // Red color as requested
        size="sm" 
        onClick={handleDelivery} 
        disabled={isPending}
        className="gap-2"
    >
        {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
            <CheckCircle2 className="h-4 w-4" />
        )}
        Retirado
    </Button>
  )
}
