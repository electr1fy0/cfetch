import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-stone-950">
        <div className="border-b border-stone-800 px-3 py-2">
          <SidebarTrigger className="border border-stone-800 bg-stone-900 text-stone-200 hover:bg-stone-800" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
