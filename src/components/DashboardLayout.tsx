import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useLocation, Outlet } from "react-router-dom";
import { useProfileModal } from "@/contexts/ProfileModalContext";
import { WriterProfile } from "@/components/WriterProfile";
import EmailVerificationGuard from "@/components/guards/EmailVerificationGuard";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  noPadding?: boolean;
}

export default function DashboardLayout({ noPadding }: DashboardLayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { isOpen, closeModal } = useProfileModal();
  const { user } = useAuth();

  const disablePadding =
    noPadding || location.pathname.includes("/writer/chats");

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <WriterProfile isOpen={isOpen} onOpenChange={closeModal} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex h-16 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1" />

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    3
                  </Badge>
                </Button>
              </div>
            </div>
          </header>
          <main
            className={`flex-1 flex flex-col min-h-0 overflow-hidden ${
              disablePadding ? "p-0" : "p-2 lg:p-3"
            }`}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
