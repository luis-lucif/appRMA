"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Laptop } from "lucide-react"
import { searchProducts } from "@/app/actions"
import { RepairTicket, Client } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Helper for status badge colors (copied from page.tsx or moved to utils ideally)
const statusColors: Record<string, string> = {
    INGRESADO: "bg-green-600",
    EN_REPARACION: "bg-yellow-500",
    PARA_ENTREGAR: "bg-blue-600",
    ENTREGADO: "bg-red-600",
}

export default function SearchProductPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<(RepairTicket & { client: Client })[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!query.trim()) return

        setIsSearching(true)
        setSearched(true)
        try {
            const res = await searchProducts({ query })
            if (res.success && res.tickets) {
                setResults(res.tickets)
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
            <h1 className="text-3xl font-bold tracking-tight">Buscar Artículos</h1>

            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    placeholder="Modelo, Categoría..."
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
                        No se encontraron artículos con ese criterio.
                    </div>
                )}

                {results.map((ticket) => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block group/item relative">
                        <div className="neon-border-flow p-[1px] rounded-lg bg-transparent transition-all duration-300">
                            <div className="flex flex-col gap-2 rounded-lg bg-[#0a0a0a] p-4 group-hover/item:bg-black transition-colors cursor-pointer text-white shadow-lg relative z-10 h-full border border-white/5 group-hover/item:border-transparent">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-secondary/20 rounded-md">
                                            <Laptop className="h-6 w-6 text-secondary-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg flex items-center gap-2 group-hover/item:text-[#FF5F1F] transition-colors duration-300">
                                                {ticket.productModel}
                                                <Badge variant="outline" className="text-xs font-normal group-hover/item:border-[#FF5F1F] group-hover/item:text-[#FF5F1F] transition-colors">
                                                    {ticket.category}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                Cliente: <span className="font-medium text-foreground group-hover/item:text-white transition-colors">{ticket.client.fullName}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-md group-hover/item:text-gray-400 transition-colors">
                                                Falla: {ticket.faultDescription}
                                            </div>
                                        </div>
                                    </div>
    
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            {format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: es })}
                                        </div>
                                        <Badge className={statusColors[ticket.status] || "bg-gray-500"}>
                                            {ticket.status === 'ENTREGADO' ? 'Retirado' :
                                                ticket.status === 'PARA_ENTREGAR' ? 'Para Entregar' :
                                                    ticket.status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
