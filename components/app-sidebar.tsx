"use client"

import { Calendar, Home, Inbox, Search, Truck, ChevronRight, LogOut } from "lucide-react"

import {

  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Ingresos",
    url: "/ingresos/new",
    icon: Inbox,
  },
  {
    title: "Egresos/Entregas",
    url: "/egresos",
    icon: Truck,
  },
  {
    title: "Buscador",
    url: "#",
    icon: Search,
    items: [
      {
        title: "Buscar por cliente",
        url: "/search/client",
      },
      {
        title: "Buscar por artículo",
        url: "/search/product",
      },
    ],
  },
]

export function AppSidebar({ user, role }: { user: any, role: string | null }) {
  const filteredItems = items.filter(item => {
    if (role !== 'admin' && (item.title === 'Ingresos' || item.title === 'Egresos/Entregas')) return false
    return true
  })

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Servicio Técnico</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 p-2">
              {user && (
                <div className="text-xs text-muted-foreground truncate" title={user.email}>
                  {user.email}
                </div>
              )}
              <form action={async () => {
                // Dynamic import to avoid server actions in client component build issues if not handled correctly
                // But since I updated actions.ts, I can import just fine if it is "use server"
                const { signOut } = await import("@/app/login/actions");
                await signOut();
              }}>
                <button type="submit" className="flex w-full items-center gap-2 rounded-md border p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
