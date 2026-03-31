import { Suspense } from "react";
import { PermissionsList } from "@/components/admin/permissions-list";

export default function PermissionsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Permissions</h1>
        <p className="text-muted-foreground">View all available permissions</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PermissionsList />
      </Suspense>
    </div>
  );
}
