"use client"

import { useState, useTransition } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { updateTicketNotes } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"

interface TicketNotesProps {
  ticketId: string
  initialNotes?: string | null
}

export function TicketNotes({ ticketId, initialNotes }: TicketNotesProps) {
  const [notes, setNotes] = useState(initialNotes || "")
  const [isPending, startTransition] = useTransition()
  
  // Track if content has changed to show save button state or similar
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
       await updateTicketNotes({ ticketId, notes })
       setHasChanges(false)
    })
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Observaciones Internas
            </CardTitle>
            <CardDescription>Notas visibles solo para el equipo técnico.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea 
                placeholder="Escribe aquí notas sobre la reparación, diagnósticos, etc..."
                value={notes}
                onChange={(e) => {
                    setNotes(e.target.value)
                    setHasChanges(true)
                }}
                className="min-h-[120px]"
            />
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={!hasChanges || isPending}
                    size="sm"
                >
                    {isPending ? "Guardando..." : "Guardar Observaciones"}
                </Button>
            </div>
        </CardContent>
    </Card>
  )
}
