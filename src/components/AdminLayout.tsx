import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function AdminLayout({ children, noPadding }: AdminLayoutProps) {
  const location = useLocation();

  // Automatically disable padding for support route (or others if needed)
  const disablePadding =
    noPadding || location.pathname.includes("/admin/support");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {/* Mobile header */}
          <div className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4 lg:hidden">
            <SidebarTrigger />
            <h2 className="ml-4 text-lg font-semibold">Admin Panel</h2>
          </div>

          {/* Conditional padding */}
          <div className={disablePadding ? "p-0" : "p-4 lg:p-6"}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
