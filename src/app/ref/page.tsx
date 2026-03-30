"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Calendar,
  Tag,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpDown,
  Grid3x3,
  List,
} from "lucide-react";

import { RefSidebar } from "@/shared/components/ref-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/utils";

// Mock data for records
const records = [
  {
    id: 1,
    name: "Sarah Chen",
    company: "TechFlow Inc.",
    email: "sarah@techflow.io",
    avatar: "/avatars/sarah.jpg",
    initials: "SC",
    status: "active",
    tags: ["Enterprise", "Hot Lead"],
    lastContact: "2 hours ago",
    value: "$125,000",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    company: "CloudScale Systems",
    email: "m.johnson@cloudscale.com",
    avatar: "",
    initials: "MJ",
    status: "pending",
    tags: ["SaaS", "Follow-up"],
    lastContact: "1 day ago",
    value: "$84,000",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    company: "Nexus Partners",
    email: "elena@nexus.partners",
    avatar: "",
    initials: "ER",
    status: "active",
    tags: ["Enterprise", "Renewal"],
    lastContact: "3 days ago",
    value: "$210,000",
    color: "bg-violet-500",
  },
  {
    id: 4,
    name: "David Kim",
    company: "StarterLab",
    email: "dkim@starterlab.io",
    avatar: "",
    initials: "DK",
    status: "inactive",
    tags: ["Startup", "Cold"],
    lastContact: "1 week ago",
    value: "$45,000",
    color: "bg-amber-500",
  },
  {
    id: 5,
    name: "Amara Okafor",
    company: "InnovateAfrica",
    email: "amara@innovate.africa",
    avatar: "",
    initials: "AO",
    status: "active",
    tags: ["International", "Priority"],
    lastContact: "5 hours ago",
    value: "$95,000",
    color: "bg-rose-500",
  },
  {
    id: 6,
    name: "James Wilson",
    company: "DataDriven Co.",
    email: "jwilson@datadriven.co",
    avatar: "",
    initials: "JW",
    status: "pending",
    tags: ["Analytics", "Demo"],
    lastContact: "2 days ago",
    value: "$67,500",
    color: "bg-cyan-500",
  },
  {
    id: 7,
    name: "Priya Sharma",
    company: "GlobalTech Solutions",
    email: "priya@globaltech.io",
    avatar: "",
    initials: "PS",
    status: "active",
    tags: ["Enterprise", "Negotiation"],
    lastContact: "4 hours ago",
    value: "$180,000",
    color: "bg-fuchsia-500",
  },
  {
    id: 8,
    name: "Tomáš Novák",
    company: "Prague Digital",
    email: "tomas@prague.digital",
    avatar: "",
    initials: "TN",
    status: "inactive",
    tags: ["EMEA", "Cold Lead"],
    lastContact: "2 weeks ago",
    value: "$32,000",
    color: "bg-sky-500",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return {
        icon: CheckCircle2,
        label: "Active",
        className: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-50 dark:bg-emerald-950",
        dotClass: "bg-emerald-500",
      };
    case "pending":
      return {
        icon: Clock,
        label: "Pending",
        className: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-amber-50 dark:bg-amber-950",
        dotClass: "bg-amber-500",
      };
    case "inactive":
      return {
        icon: AlertCircle,
        label: "Inactive",
        className: "text-muted-foreground",
        bgClass: "bg-muted",
        dotClass: "bg-muted-foreground",
      };
    default:
      return {
        icon: CheckCircle2,
        label: "Unknown",
        className: "text-muted-foreground",
        bgClass: "bg-muted",
        dotClass: "bg-muted-foreground",
      };
  }
};

const getTagVariant = (tag: string): "default" | "secondary" | "outline" => {
  const enterprise = ["Enterprise", "Priority", "Hot Lead", "Negotiation"];
  const secondary = ["Follow-up", "Demo", "Renewal"];
  if (enterprise.some((t) => tag.includes(t))) return "default";
  if (secondary.some((t) => tag.includes(t))) return "secondary";
  return "outline";
};

function RecordCard({ record }: { record: typeof records[0] }) {
  const statusConfig = getStatusConfig(record.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 ring-2 ring-background">
              <AvatarImage src={record.avatar} alt={record.name} />
              <AvatarFallback className={cn("text-white text-sm font-medium", record.color)}>
                {record.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold truncate">
                {record.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{record.company}</span>
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-3">
        {/* Status */}
        <div className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium w-fit",
          statusConfig.bgClass,
          statusConfig.className
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotClass)} />
          <StatusIcon className="h-3 w-3 mr-0.5" />
          {statusConfig.label}
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{record.email}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {record.tags.map((tag) => (
            <Badge
              key={tag}
              variant={getTagVariant(tag)}
              className="text-xs px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t">
        <div className="flex items-center justify-between w-full text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{record.lastContact}</span>
          </div>
          <div className="font-semibold text-foreground">
            {record.value}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function RecordListRow({ record }: { record: typeof records[0] }) {
  const statusConfig = getStatusConfig(record.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors border-b last:border-b-0">
      <Avatar className="h-10 w-10 ring-2 ring-background flex-shrink-0">
        <AvatarImage src={record.avatar} alt={record.name} />
        <AvatarFallback className={cn("text-white text-sm font-medium", record.color)}>
          {record.initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 min-w-0">
          <div className="font-medium truncate">{record.name}</div>
          <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{record.company}</span>
          </div>
        </div>

        <div className="col-span-3 text-sm text-muted-foreground truncate flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{record.email}</span>
        </div>

        <div className="col-span-2">
          <div className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium w-fit",
            statusConfig.bgClass,
            statusConfig.className
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotClass)} />
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </div>
        </div>

        <div className="col-span-2 flex flex-wrap gap-1">
          {record.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant={getTagVariant(tag)}
              className="text-xs px-2 py-0"
            >
              {tag}
            </Badge>
          ))}
          {record.tags.length > 2 && (
            <Badge variant="outline" className="text-xs px-2 py-0">
              +{record.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="col-span-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{record.lastContact}</span>
          <span className="font-semibold">{record.value}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function RefPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "active" | "pending" | "inactive">("all");

  const filteredRecords = React.useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        searchQuery === "" ||
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || record.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus]);

  return (
    <SidebarProvider>
      <RefSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/ref">Design Reference</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Records</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Records
              </h1>
              <p className="text-muted-foreground">
                Manage your contacts and track opportunities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {filteredRecords.length} of {records.length} records
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, company, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Status
                        {filterStatus !== "all" && (
                          <Badge variant="secondary" className="ml-1">
                            {filterStatus}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem
                        onClick={() => setFilterStatus("all")}
                        className={filterStatus === "all" ? "bg-accent" : ""}
                      >
                        All Statuses
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setFilterStatus("active")}
                        className={filterStatus === "active" ? "bg-accent" : ""}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setFilterStatus("pending")}
                        className={filterStatus === "pending" ? "bg-accent" : ""}
                      >
                        <Clock className="mr-2 h-4 w-4 text-amber-500" />
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setFilterStatus("inactive")}
                        className={filterStatus === "inactive" ? "bg-accent" : ""}
                      >
                        <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                        Inactive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* View Toggle */}
                  <div className="flex rounded-md border">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="rounded-r-none"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="rounded-l-none"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records Display */}
          {viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="grid grid-cols-12 gap-4 px-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Tags</div>
                  <div className="col-span-2 text-right">Last Contact / Value</div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRecords.map((record) => (
                  <RecordListRow key={record.id} record={record} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No records found</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first record"}
                  </p>
                </div>
                {searchQuery || filterStatus !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
