import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/app/actions";

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const role = await getUserRole()

    return (
        <SidebarProvider>
            <AppSidebar user={user} role={role} />
            <SidebarInset>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center gap-2 py-4">
                        <SidebarTrigger />
                        <span className="font-semibold">Sistema RMA</span>
                    </div>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
