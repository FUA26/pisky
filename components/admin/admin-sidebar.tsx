"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Roles",
    href: "/admin/roles",
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-background w-64 border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mb-1 block rounded-md px-4 py-2 transition-colors",
              pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
