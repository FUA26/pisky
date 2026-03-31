"use client";

import { useQuery } from "@tanstack/react-query";

export function PermissionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/permissions");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {Object.entries(data?.grouped || {}).map(([category, perms]: [string, any]) => (
        <div key={category}>
          <h2 className="mb-3 text-lg font-semibold capitalize">{category}</h2>
          <div className="divide-y rounded-lg border">
            {perms.map((perm: any) => (
              <div key={perm.id} className="px-4 py-3">
                <code className="text-sm">{perm.name}</code>
                <p className="text-muted-foreground mt-1 text-sm">{perm.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
