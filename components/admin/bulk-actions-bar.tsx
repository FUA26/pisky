"use client";

import { Trash2, Shield } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onAssignRole?: () => void;
}

export function BulkActionsBar({ selectedCount, onDelete, onAssignRole }: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-background fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-lg border p-4 shadow-lg">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <div className="flex gap-2">
        {onAssignRole && (
          <button
            onClick={onAssignRole}
            className="bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm"
          >
            <Shield className="h-4 w-4" />
            Assign Role
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
