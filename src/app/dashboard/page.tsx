import { DashboardHeader } from "@/shared/components/dashboard/dashboard-header";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import { ActivityTable } from "@/shared/components/dashboard/activity-table";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Plus } from "lucide-react";

const mockActivities = [
  {
    id: "1",
    person: {
      name: "Alice Johnson",
      initials: "AJ",
    },
    action: "created a new",
    target: "deal with Acme Corp",
    time: "2 minutes ago",
    type: "create" as const,
  },
  {
    id: "2",
    person: {
      name: "Bob Smith",
      initials: "BS",
    },
    action: "updated",
    target: "company profile for TechStart",
    time: "15 minutes ago",
    type: "update" as const,
  },
  {
    id: "3",
    person: {
      name: "Carol Williams",
      initials: "CW",
    },
    action: "deleted",
    target: "old contact",
    time: "1 hour ago",
    type: "delete" as const,
  },
  {
    id: "4",
    person: {
      name: "David Brown",
      initials: "DB",
    },
    action: "created a new",
    target: "task for Q2 review",
    time: "2 hours ago",
    type: "create" as const,
  },
  {
    id: "5",
    person: {
      name: "Eva Martinez",
      initials: "EM",
    },
    action: "updated",
    target: "deal stage for Enterprise contract",
    time: "3 hours ago",
    type: "update" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Deals"
              value="1,234"
              change={{ value: "+12% from last month", positive: true }}
            />
            <StatCard
              title="Active Companies"
              value="89"
              change={{ value: "+5% from last month", positive: true }}
            />
            <StatCard
              title="Pipeline Value"
              value="$2.4M"
              change={{ value: "+18% from last month", positive: true }}
            />
            <StatCard
              title="Conversion Rate"
              value="24%"
              change={{ value: "-3% from last month", positive: false }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ActivityTable activities={mockActivities} />
            </div>

            {/* Quick Actions - Takes 1 column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create new deal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add person
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Import data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create workflow
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                  <CardDescription>
                    3 tasks due today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Follow up with Acme</span>
                      <span className="text-xs text-muted-foreground">10:00 AM</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Discuss contract renewal
                    </p>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Review proposal</span>
                      <span className="text-xs text-muted-foreground">2:00 PM</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      TechStart enterprise deal
                    </p>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Team standup</span>
                      <span className="text-xs text-muted-foreground">4:30 PM</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Weekly sync
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Overview</CardTitle>
              <CardDescription>
                Key metrics for this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Deals Closed</span>
                    <span className="text-muted-foreground">45 / 60</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: "75%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Revenue Target</span>
                    <span className="text-muted-foreground">$2.4M / $3M</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: "80%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">New Contacts</span>
                    <span className="text-muted-foreground">120 / 150</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: "80%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
