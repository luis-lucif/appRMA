"use client"

import { useState } from "react"
import { UploadButton } from "@/components/upload-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Trash2, ExternalLink, Plus, Image as ImageIcon } from "lucide-react"
import { updateTicketAttachments } from "@/app/actions"

interface InvoiceManagerProps {
    ticketId: string
    initialAttachments?: string[]
}

export function InvoiceManager({ ticketId, initialAttachments = [] }: InvoiceManagerProps) {
    const [attachments, setAttachments] = useState<string[]>(initialAttachments)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleUploadComplete = async (url: string, key: string, publicUrl: string) => {
        setIsUpdating(true)
        try {
            const newAttachments = [...attachments, publicUrl]
            const res = await updateTicketAttachments({ ticketId, attachments: newAttachments })
            if (res.error) {
                alert(res.error)
                return
            }
            setAttachments(newAttachments)
        } catch (error) {
            console.error(error)
            alert("Error al agregar adjunto")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async (urlToDelete: string) => {
        if (!confirm("¿Seguro que deseas eliminar este archivo?")) return

        setIsUpdating(true)
        try {
            const newAttachments = attachments.filter(url => url !== urlToDelete)
            const res = await updateTicketAttachments({ ticketId, attachments: newAttachments })
            if (res.error) {
                alert(res.error)
                return
            }
            setAttachments(newAttachments)
        } catch (error) {
            console.error(error)
            alert("Error al eliminar adjunto")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Adjuntos / Facturas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {attachments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {attachments.map((url, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/30 transition-colors relative group">
                                    {url.toLowerCase().endsWith('.pdf') ? (
                                        <FileText className="h-10 w-10 text-red-500 shrink-0" />
                                    ) : (
                                        <img
                                            src={url}
                                            alt={`Adjunto ${index + 1}`}
                                            className="h-10 w-10 object-cover rounded border bg-white shrink-0"
                                        />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate mb-1">Archivo {index + 1}</div>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                                        >
                                            Ver <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(url)}
                                        disabled={isUpdating}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive absolute top-2 right-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-muted/5 gap-3">
                        <p className="text-sm font-medium text-muted-foreground">
                            {attachments.length === 0 ? "No hay archivos cargados" : "Agregar otro archivo"}
                        </p>
                        <UploadButton
                            label="Subir Archivo"
                            onUploadComplete={handleUploadComplete}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
