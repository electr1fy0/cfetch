import { auth } from "@/auth";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-950">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar avatarUrl={session?.user?.image ?? null} />
      <SidebarInset className="bg-stone-950">
        <div className="border-b border-stone-800 px-3 py-2">
          <SidebarTrigger className="border border-stone-800 bg-stone-900 text-stone-200 hover:bg-stone-800" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
