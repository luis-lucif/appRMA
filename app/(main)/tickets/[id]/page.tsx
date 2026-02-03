import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TicketNotes } from "@/components/ticket-notes"
import { TicketDeliveryButton } from "@/components/ticket-delivery-button"
import { EditTicketDialog } from "@/components/edit-ticket-dialog"
import { EditClientDialog } from "@/components/edit-client-dialog"
import { EditShippingDialog } from "@/components/edit-shipping-dialog"
import { TicketStatusSelect } from "@/components/ticket-status-select"
import { InvoiceManager } from "@/components/invoice-manager"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Phone, Mail, MapPin, Truck, Calendar, User, Smartphone, AlertCircle, FileText, ExternalLink } from "lucide-react"
import { getUserRole as getUserRoleAction } from "@/app/actions"


interface TicketDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
    const { id } = await params
    const ticket = await db.repairTicket.findUnique({
        where: { id },
        include: {
            client: true,
            logs: {
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })

    if (!ticket) {
        notFound()
    }

    const role = await getUserRoleAction()
    const isAdmin = role === 'admin'

    const statusColors = {
        INGRESADO: "bg-green-500",
        EN_REPARACION: "bg-yellow-500",
        PARA_ENTREGAR: "bg-blue-500",
        ENTREGADO: "bg-red-500",
    }

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orden #{ticket.id.slice(0, 8)}</h1>
                    <p className="text-muted-foreground">
                        Ingresado el {format(new Date(ticket.createdAt), "PPP 'a las' HH:mm", { locale: es })}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <TicketStatusSelect ticketId={ticket.id} currentStatus={ticket.status} />
                    {isAdmin && (
                        <form action={async () => {
                            "use server"
                            const { deleteTicket } = await import("@/app/actions")
                            await deleteTicket({ ticketId: ticket.id })
                        }}>
                            <button className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600">
                                Borrar
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Columna Izquierda: Datos del Equipo y Falla */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="h-5 w-5" />
                                    Detalles del Equipo
                                </div>
                                {isAdmin && <EditTicketDialog ticket={ticket} />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Modelo</div>
                                    <div className="text-lg font-semibold">{ticket.productModel}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Categoría</div>
                                    <div className="text-lg">{ticket.category}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Reporte de Falla
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{ticket.faultDescription}</p>
                        </CardContent>
                    </Card>

                    {ticket.location === 'CORREO' && (
                        <Card className="border-blue-200 bg-blue-50/10">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-blue-500">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Datos de Envío
                                    </div>
                                    {isAdmin && <EditShippingDialog ticket={ticket} />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Provincia</div>
                                        <div>{ticket.shippingProvince || "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Localidad</div>
                                        <div>{ticket.shippingCity || "-"}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Dirección</div>
                                    <div className="font-medium">{ticket.shippingAddress || "-"}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">C.P.</div>
                                        <div>{ticket.shippingPostalCode || "-"}</div>
                                    </div>
                                </div>
                                {ticket.shippingNotes && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Observaciones de Envío</div>
                                        <div className="text-sm italic">{ticket.shippingNotes}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <TicketNotes ticketId={ticket.id} initialNotes={ticket.internalNotes} />
                </div>

                {/* Columna Derecha: Cliente y Ubicación */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Cliente
                                </div>
                                {isAdmin && <EditClientDialog client={ticket.client} />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-bold text-lg">{ticket.client.fullName}</div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{ticket.client.phone}</span>
                            </div>
                            {ticket.client.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a href={`mailto:${ticket.client.email}`} className="text-blue-500 hover:underline text-sm truncate">
                                        {ticket.client.email}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <InvoiceManager
                        ticketId={ticket.id}
                        initialAttachments={Array.from(new Set([
                            ...(ticket.attachments || []),
                            ...(ticket.purchaseInvoiceUrl ? [ticket.purchaseInvoiceUrl] : [])
                        ]))}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Ubicación
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-lg">{ticket.location}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Historial de Cambios (Audit Logs) */}
                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Historial de Cambios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {ticket.logs && ticket.logs.length > 0 ? (
                                    ticket.logs.map((log: any) => (
                                        <div key={log.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium leading-none">
                                                        {log.action === 'CREATED' && 'Ticket Creado'}
                                                        {log.action === 'STATUS_CHANGE' && 'Cambio de Estado'}
                                                        {log.action === 'DELIVERED' && 'Entrega / Retiro'}
                                                        {!['CREATED', 'STATUS_CHANGE', 'DELIVERED'].includes(log.action) && log.action}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(log.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {log.details}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-4">
                                        No hay registros de actividad.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
