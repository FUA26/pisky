"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/data-table";
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar";
import Link from "next/link";

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => (
      <Link href={`/admin/users/${row.original.id}`} className="text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roleName",
    header: "Role",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <Link href={`/admin/users/${row.original.id}`} className="text-primary hover:underline">
        Edit
      </Link>
    ),
  },
];

export function UsersTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <DataTable columns={columns} data={data?.users || []} />
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onDelete={() => {
          // TODO: Implement bulk delete
        }}
        onAssignRole={() => {
          // TODO: Implement bulk role assignment
        }}
      />
    </>
  );
}
