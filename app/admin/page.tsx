import { getDatabase } from "@/config/database";
import { users, roles } from "@/features/database/models/schema";
import { count } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const db = getDatabase()!;
  const [userCount, roleCount] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(roles),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your application</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard title="Total Users" value={userCount[0]?.count || 0} />
        <StatsCard title="Total Roles" value={roleCount[0]?.count || 0} />
        <StatsCard title="Active Sessions" value="0" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}

function StatsCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
      <div className="space-y-2">
        <Link
          href="/admin/users"
          className="hover:bg-muted block rounded border p-3 transition-colors"
        >
          Manage Users
        </Link>
        <Link
          href="/admin/roles"
          className="hover:bg-muted block rounded border p-3 transition-colors"
        >
          Manage Roles
        </Link>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
      <p className="text-muted-foreground text-sm">View audit logs for recent activity</p>
      <Link href="/admin/audit-logs" className="text-primary text-sm hover:underline">
        View All Logs →
      </Link>
    </div>
  );
}
