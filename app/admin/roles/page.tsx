import { Suspense } from "react";
import { RolesTable } from "@/components/admin/roles-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function RolesPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Manage roles and permissions</p>
        </div>
        <Link href="/admin/roles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RolesTable />
      </Suspense>
    </div>
  );
}
