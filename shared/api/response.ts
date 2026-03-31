import { NextResponse } from "next/server";
import type { ApiResponse, ResponseMeta } from "../types/api";

/**
 * Create a successful API response
 */
export function success<T>(
  data: T,
  meta?: ResponseMeta,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a created response (201)
 */
export function created<T>(data: T, meta?: ResponseMeta): NextResponse<ApiResponse<T>> {
  return success(data, meta, 201);
}

/**
 * Create a no-content response (204)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create a paginated response
 */
export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]>> {
  const meta: ResponseMeta = {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };

  return success(data, meta);
}

/**
 * Response helpers grouped by HTTP status
 */
export const response = {
  ok: <T>(data: T) => success(data),
  created: <T>(data: T) => created(data),
  noContent: () => noContent(),
  badRequest: (message: string, details?: unknown) =>
    NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message, details } },
      { status: 400 }
    ),
  unauthorized: (message: string = "Unauthorized") =>
    NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message } },
      { status: 401 }
    ),
  forbidden: (message: string = "Forbidden") =>
    NextResponse.json({ success: false, error: { code: "FORBIDDEN", message } }, { status: 403 }),
  notFound: (message: string = "Not found") =>
    NextResponse.json({ success: false, error: { code: "NOT_FOUND", message } }, { status: 404 }),
  conflict: (message: string, details?: unknown) =>
    NextResponse.json(
      { success: false, error: { code: "CONFLICT", message, details } },
      { status: 409 }
    ),
  serverError: (message: string = "Internal server error") =>
    NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    ),
};
