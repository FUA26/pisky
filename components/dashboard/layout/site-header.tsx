"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Search, Settings, User, LogOut, Loader2, Check, ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

// Notification types
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "mention";
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New comment",
    message: 'Sarah commented on "Design System Updates"',
    time: "2m ago",
    read: false,
    type: "mention",
  },
  {
    id: "2",
    title: "Deployment successful",
    message: "Your changes have been deployed to production",
    time: "1h ago",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Review requested",
    message: 'John requested your review on "API Integration"',
    time: "3h ago",
    read: true,
    type: "info",
  },
  {
    id: "4",
    title: "Security alert",
    message: "New login detected from unknown device",
    time: "1d ago",
    read: true,
    type: "warning",
  },
  {
    id: "5",
    title: "Task completed",
    message: '"Database migration" has been completed',
    time: "2d ago",
    read: true,
    type: "success",
  },
];

export function SiteHeader() {
  const router = useRouter();
  const { isMobile, state } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notificationIcon = (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b backdrop-blur">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-base font-semibold">Dashboard</h1>

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => router.push("/search")}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  {notificationIcon}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <DropdownMenuLabel className="p-0 text-sm font-semibold">
                    Notifications
                  </DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-primary hover:text-primary h-auto p-0 text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bell className="text-muted-foreground mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="focus:bg-accent flex cursor-pointer items-start gap-3 border-none px-4 py-3"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div
                          className={`mt-0.5 flex size-2 shrink-0 rounded-full ${
                            notification.read ? "opacity-0" : "opacity-100"
                          } ${
                            notification.type === "success"
                              ? "bg-green-500"
                              : notification.type === "warning"
                                ? "bg-amber-500"
                                : notification.type === "mention"
                                  ? "bg-blue-500"
                                  : "bg-primary"
                          }`}
                        />
                        <div className="flex-1 space-y-1">
                          <p
                            className={`text-sm font-medium ${
                              notification.read ? "text-muted-foreground" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-muted-foreground text-xs whitespace-nowrap">
                          {notification.time}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <div className="border-t px-2 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      setShowNotifications(false);
                      router.push("/notifications");
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/avatars/user.jpg" alt="User" className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">U</AvatarFallback>
                </Avatar>
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/user.jpg" alt="User" className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">User Name</p>
                    <p className="text-muted-foreground text-xs">user@example.com</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isLoggingOut ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
