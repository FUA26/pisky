export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SortOrder = "asc" | "desc";

export type SortableField<T> = keyof T;
