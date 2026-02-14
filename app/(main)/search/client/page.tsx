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
                    <div key={client.id} className="neon-border-flow p-[1px] rounded-lg bg-transparent transition-all duration-300 group/item relative">
                        <div className="flex flex-col gap-2 rounded-lg bg-[#0a0a0a] p-4 group-hover/item:bg-black transition-colors cursor-default text-white shadow-lg relative z-10 h-full border border-white/5 group-hover/item:border-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg group-hover/item:text-[#FF5F1F] transition-colors duration-300">{client.fullName}</div>
                                        <div className="text-sm text-muted-foreground group-hover/item:text-gray-400 transition-colors">
                                            {client.phone} {client.email && `• ${client.email}`}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 group-hover/item:text-white transition-colors">
                                            {client.tickets.length} tickets registrados
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-3 items-end">
                                    {client.tickets.length > 0 ? (
                                        client.tickets.map(ticket => (
                                            <div key={ticket.id} className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: es })}
                                                    </div>
                                                    <Badge className={`text-[10px] px-1.5 py-0 h-5 ${statusColors[ticket.status] || "bg-gray-500"}`}>
                                                        {ticket.status === 'ENTREGADO' ? 'Retirado' :
                                                            ticket.status === 'PARA_ENTREGAR' ? 'Para Entregar' :
                                                                ticket.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                <Button asChild variant="outline" size="sm" className="h-8 group-hover/item:border-[#FF5F1F] group-hover/item:text-[#FF5F1F] transition-all duration-300 cursor-pointer">
                                                    <Link href={`/tickets/${ticket.id}`}>
                                                        Ver Cliente {ticket.productModel}
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Sin tickets</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
