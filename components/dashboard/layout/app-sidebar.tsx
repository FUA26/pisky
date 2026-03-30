"use client";

import * as React from "react";
import { LayoutDashboard, Layers, Palette, BookOpen, Settings2 } from "lucide-react";

import { NavMain } from "./nav-main";
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Components",
      url: "/components",
      icon: Layers,
      items: [
        { title: "Buttons", url: "/components/buttons" },
        { title: "Cards", url: "/components/cards" },
        { title: "Forms", url: "/components/forms" },
        { title: "Badges", url: "/components/badges" },
      ],
    },
    {
      title: "Design System",
      url: "/design",
      icon: Palette,
      items: [
        { title: "Colors", url: "/design/colors" },
        { title: "Typography", url: "/design/typography" },
        { title: "Icons", url: "/design/icons" },
      ],
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: BookOpen,
      items: [
        { title: "Getting Started", url: "/docs/getting-started" },
        { title: "Guides", url: "/docs/guides" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        { title: "General", url: "/settings/general" },
        { title: "Appearance", url: "/settings/appearance" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Layers className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Pisky</span>
            <span className="text-muted-foreground truncate text-xs">Design System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
