import { db } from "@/lib/db"
import { DashboardView } from "@/components/dashboard-view"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const tickets = await db.repairTicket.findMany({
    include: {
      client: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <DashboardView tickets={tickets} />
}
