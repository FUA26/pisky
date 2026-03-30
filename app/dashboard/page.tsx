import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/dashboard/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Welcome Section */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to Pisky Design System</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card rounded-xl border p-6">
              <p className="text-muted-foreground text-sm font-medium">Components</p>
              <p className="mt-2 text-3xl font-bold">61</p>
              <p className="text-muted-foreground mt-1 text-xs">+3 this week</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <p className="text-muted-foreground text-sm font-medium">Downloads</p>
              <p className="mt-2 text-3xl font-bold">2.4k</p>
              <p className="text-muted-foreground mt-1 text-xs">+12% from last month</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <p className="text-muted-foreground text-sm font-medium">Contributors</p>
              <p className="mt-2 text-3xl font-bold">18</p>
              <p className="text-muted-foreground mt-1 text-xs">Active team members</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <p className="text-muted-foreground text-sm font-medium">Version</p>
              <p className="mt-2 text-3xl font-bold">1.2</p>
              <p className="text-muted-foreground mt-1 text-xs">Latest release</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="bg-card rounded-xl border p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold">Recent Updates</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Latest changes to the design system
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex gap-4 border-b pb-4">
                  <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <span className="text-lg">🎨</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New color tokens added</p>
                    <p className="text-muted-foreground text-sm">
                      Extended palette with 20 new shades
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs">2h ago</span>
                </div>
                <div className="flex gap-4 border-b pb-4">
                  <div className="bg-secondary/10 text-secondary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Animation system</p>
                    <p className="text-muted-foreground text-sm">
                      Motion tokens and keyframes library
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs">1d ago</span>
                </div>
                <div className="flex gap-4">
                  <div className="bg-success/10 text-success flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <span className="text-lg">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Components audit complete</p>
                    <p className="text-muted-foreground text-sm">
                      All components now follow new standards
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs">3d ago</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-muted-foreground mt-1 text-sm">Frequently used</p>
              <div className="mt-6 space-y-2">
                <button className="bg-background hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors">
                  <span className="text-lg">➕</span>
                  <span className="text-sm font-medium">New Component</span>
                </button>
                <button className="bg-background hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors">
                  <span className="text-lg">📦</span>
                  <span className="text-sm font-medium">Export Package</span>
                </button>
                <button className="bg-background hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors">
                  <span className="text-lg">📖</span>
                  <span className="text-sm font-medium">Documentation</span>
                </button>
                <button className="bg-background hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors">
                  <span className="text-lg">⚙️</span>
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
