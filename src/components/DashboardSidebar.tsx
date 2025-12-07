import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  Search,
  Gavel,
  MessageSquare,
  Trophy,
  Wallet,
  Bell,
  User,
  HeadphonesIcon,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useChatContext } from "@/contexts/ChatContext"; // Import chat context
import { useProfileModal } from "@/contexts/ProfileModalContext";

const menuItems = [
  { title: "My Orders", url: "/writer/orders/in-progress/all", base: "/writer/orders", icon: FileText },
  { title: "Available Orders", url: "/writer/available-orders/all", base: "/writer/available-orders", icon: Search },
  { title: "My Bids", url: "/writer/my-bids/open", base: "/writer/my-bids", icon: Gavel },
  { title: "Chats", url: "/writer/chats", icon: MessageSquare },
  { title: "Leaderboard", url: "/writer/leaderboard", icon: Trophy },
  { title: "Balance", url: "/writer/balance/transactions", base: "/writer/balance", icon: Wallet },
  { title: "Notifications", url: "/writer/notifications", icon: Bell },
];

export function DashboardSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const { unreadCount: unreadNotifications } = useNotificationContext();
  const { unreadChats } = useChatContext();
  const { openModal } = useProfileModal();

  // Helper to get initials
  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    const parts = fullName.split(" ");
    return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  };

  const isActive = (path: string) => {
    const normalize = (p: string) => p.replace(/\/+$/, "");
    return normalize(currentPath).startsWith(normalize(path));
  };

  const getUnreadBadge = (count: number) => {
    if (count === 0) return null;
    const displayCount = count > 9 ? "9+" : count.toString();
    return (
      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-primary px-1.5 text-[10px] font-bold text-white">
        {displayCount}
      </span>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* Profile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {open && (
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{getInitials(user?.full_name)}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="font-semibold text-sm truncate">{user?.full_name || "User"}</h1>
                <p className="text-xs text-muted-foreground truncate">{user?.role || "Writer"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Theme Toggle + Profile Dropdown */}
        <div className="hidden lg:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 p-0"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">{getInitials(user?.full_name)}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center space-x-2 p-2">
                <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{getInitials(user?.full_name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openModal} className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/writer/notifications-settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sidebar Menu */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          {/*<SidebarGroupLabel className="px-4 text-muted-foreground">Dashboard</SidebarGroupLabel>*/}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const badge =
                  item.title === "Notifications"
                    ? getUnreadBadge(unreadNotifications)
                    : item.title === "Chats"
                    ? getUnreadBadge(unreadChats)
                    : null;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.base || item.url)}>
                      <NavLink to={item.url} className="flex items-center">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        {badge}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Support Footer */}
      <div className="border-t border-border p-4 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Support</p>
            <p className="text-xs text-muted-foreground">Get help anytime</p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
