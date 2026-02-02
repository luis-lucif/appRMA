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
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                        <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-secondary/20 rounded-md">
                                        <Laptop className="h-6 w-6 text-secondary-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg flex items-center gap-2">
                                            {ticket.productModel}
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {ticket.category}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            Cliente: <span className="font-medium text-foreground">{ticket.client.fullName}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                                            Falla: {ticket.faultDescription}
                                        </div>
                                    </div>
                                </div>

                                <Badge className={statusColors[ticket.status] || "bg-gray-500"}>
                                    {ticket.status === 'ENTREGADO' ? 'Retirado' : ticket.status.replace("_", " ")}
                                </Badge>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
