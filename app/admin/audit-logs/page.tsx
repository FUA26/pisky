import { Suspense } from "react";
import { AuditLogsTimeline } from "@/components/admin/audit-log-timeline";

export default function AuditLogsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <AuditLogsTimeline />
      </Suspense>
    </div>
  );
}
