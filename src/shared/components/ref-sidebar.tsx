"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Settings,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import { NavUser } from "@/shared/components/nav-user";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Records",
    url: "/ref",
    icon: Users,
    isActive: true,
  },
  {
    title: "Companies",
    url: "#",
    icon: Building2,
  },
  {
    title: "Projects",
    url: "#",
    icon: FolderKanban,
  },
];

const settingsItem = {
  title: "Settings",
  url: "#",
  icon: Settings,
};

export function RefSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            P
          </div>
          <span className="font-semibold text-lg">Pisky</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={settingsItem.title}>
                  <a href={settingsItem.url}>
                    <settingsItem.icon className="h-4 w-4" />
                    <span>{settingsItem.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: "Demo User",
          email: "demo@pisky.io",
          avatar: "/avatars/demo.jpg",
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
