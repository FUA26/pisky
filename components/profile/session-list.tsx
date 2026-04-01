"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

export function SessionList() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await fetch("/api/settings/sessions");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/settings/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {data.map((session: any) => (
        <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">
              {session.userAgent?.includes("Chrome") && "Chrome"}
              {session.userAgent?.includes("Firefox") && "Firefox"}
              {session.userAgent?.includes("Safari") && "Safari"}
              {!session.userAgent?.includes("Chrome") &&
                !session.userAgent?.includes("Firefox") &&
                !session.userAgent?.includes("Safari") &&
                "Unknown Browser"}
            </p>
            <p className="text-muted-foreground text-sm">
              {session.ipAddress || "Unknown IP"} • Last active{" "}
              {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => revokeMutation.mutate(session.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
