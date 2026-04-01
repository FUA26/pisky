"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function AuditLogsTimeline() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/audit-logs");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {data?.logs?.map((log: any) => (
        <div key={log.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{log.action}</p>
              <p className="text-muted-foreground text-sm">
                by {log.user?.name} •{" "}
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </p>
            </div>
            <div className="text-muted-foreground text-right text-sm">{log.ipAddress}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
