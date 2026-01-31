"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"
import { updateShippingDetails } from "@/app/actions"
import { useRouter } from "next/navigation"

interface EditShippingDialogProps {
  ticket: {
    id: string
    shippingProvince: string | null
    shippingCity: string | null
    shippingAddress: string | null
    shippingPostalCode: string | null
    shippingNotes: string | null
  }
}

export function EditShippingDialog({ ticket }: EditShippingDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const [province, setProvince] = useState(ticket.shippingProvince || "")
  const [city, setCity] = useState(ticket.shippingCity || "")
  const [address, setAddress] = useState(ticket.shippingAddress || "")
  const [postalCode, setPostalCode] = useState(ticket.shippingPostalCode || "")
  const [notes, setNotes] = useState(ticket.shippingNotes || "")

  const handleSave = () => {
    startTransition(async () => {
        await updateShippingDetails({
            ticketId: ticket.id,
            shippingProvince: province,
            shippingCity: city,
            shippingAddress: address,
            shippingPostalCode: postalCode,
            shippingNotes: notes
        })
        setOpen(false)
        router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Datos de Envío</DialogTitle>
          <DialogDescription>
            Modificar dirección y observaciones para el correo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="province" className="text-right">
              Provincia
            </Label>
            <Input
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">
              Localidad
            </Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Dirección
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cp" className="text-right">
              C.P.
            </Label>
            <Input
              id="cp"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
