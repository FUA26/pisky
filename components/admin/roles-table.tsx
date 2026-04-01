"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/data-table";
import Link from "next/link";

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => (
      <Link href={`/admin/roles/${row.original.id}`} className="text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "parentName",
    header: "Parent Role",
  },
  {
    accessorKey: "userCount",
    header: "Users",
  },
  {
    accessorKey: "permissionCount",
    header: "Permissions",
  },
];

export function RolesTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return <DataTable columns={columns} data={data?.roles || []} />;
}
