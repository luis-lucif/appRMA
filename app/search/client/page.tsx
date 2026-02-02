"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User } from "lucide-react"
import { searchClients } from "@/app/actions"
import { Client, RepairTicket } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const statusColors: Record<string, string> = {
    INGRESADO: "bg-green-600",
    EN_REPARACION: "bg-yellow-500",
    PARA_ENTREGAR: "bg-blue-600",
    ENTREGADO: "bg-red-600",
}

export default function SearchClientPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<(Client & { tickets: RepairTicket[] })[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!query.trim()) return

        setIsSearching(true)
        setSearched(true)
        try {
            const res = await searchClients({ query })
            if (res.success && res.clients) {
                setResults(res.clients)
            } else {
                setResults([])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
            <h1 className="text-3xl font-bold tracking-tight">Buscar Clientes</h1>

            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    placeholder="Nombre del cliente..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                    <Search className="mr-2 h-4 w-4" />
                    {isSearching ? "Buscando..." : "Buscar"}
                </Button>
            </form>

            <div className="space-y-4">
                {searched && results.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        No se encontraron clientes con ese nombre.
                    </div>
                )}

                {results.map((client) => (
                    <Card key={client.id} className="hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg">{client.fullName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {client.phone} {client.email && `• ${client.email}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {client.tickets.length} tickets registrados
                                    </div>
                                </div>
                            </div>

                            {/* Assuming we want to see the latest ticket or list of tickets 
                                Since there isn't a dedicated client page yet, maybe we link to the latest ticket 
                                or just show a list of tickets if expanded?
                                For now, let's link to the first ticket if exists, or just show ID.
                                Ideally, we'd have /clients/[id] page. 
                                Since we don't, I'll list the tickets below simply.
                             */}
                            <div className="flex flex-col gap-3 items-end">
                                {client.tickets.length > 0 ? (
                                    client.tickets.map(ticket => (
                                        <div key={ticket.id} className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: es })}
                                                </div>
                                                <Badge className={`text-[10px] px-1.5 py-0 h-5 ${statusColors[ticket.status] || "bg-gray-500"}`}>
                                                    {ticket.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <Link href={`/tickets/${ticket.id}`} passHref>
                                                <Button variant="outline" size="sm" className="h-8">
                                                    Ver Ticket {ticket.productModel}
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">Sin tickets</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
