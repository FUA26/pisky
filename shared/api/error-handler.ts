import { NextResponse } from "next/server";
import type { ApiError, ErrorCode } from "../types/api";
import { errorCodeToStatus } from "../types/api";

/**
 * Custom API Error class
 */
export class ApiErrorImpl extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: unknown,
  statusCode?: number
): NextResponse {
  const status = statusCode ?? errorCodeToStatus[code];
  const error: ApiError = {
    code,
    message,
    details: process.env.NODE_ENV === "development" ? details : undefined,
    stack: process.env.NODE_ENV === "development" ? new Error().stack : undefined,
  };

  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Handle unknown errors and convert to API response
 */
export function handleError(error: unknown): NextResponse {
  // Log error for debugging
  console.error("[API Error]", error);

  // ApiErrorImpl - use as-is
  if (error instanceof ApiErrorImpl) {
    return createErrorResponse(error.code, error.message, error.details, error.statusCode);
  }

  // Zod validation errors
  if (error && typeof error === "object" && "issues" in error) {
    return createErrorResponse(
      "VALIDATION_ERROR" as ErrorCode,
      "Validation failed",
      (error as { issues: unknown }).issues
    );
  }

  // Standard Error
  if (error instanceof Error) {
    return createErrorResponse(
      "INTERNAL_ERROR" as ErrorCode,
      error.message || "An unexpected error occurred"
    );
  }

  // Unknown error type
  return createErrorResponse("INTERNAL_ERROR" as ErrorCode, "An unexpected error occurred");
}

/**
 * Helper error constructors
 */
export const ApiErrorHelpers = {
  badRequest: (message: string, details?: unknown) =>
    new ApiErrorImpl("VALIDATION_ERROR" as ErrorCode, message, details, 400),

  unauthorized: (message: string = "Unauthorized") =>
    new ApiErrorImpl("UNAUTHORIZED" as ErrorCode, message, undefined, 401),

  forbidden: (message: string = "Forbidden") =>
    new ApiErrorImpl("FORBIDDEN" as ErrorCode, message, undefined, 403),

  notFound: (message: string = "Resource not found") =>
    new ApiErrorImpl("NOT_FOUND" as ErrorCode, message, undefined, 404),

  conflict: (message: string, details?: unknown) =>
    new ApiErrorImpl("CONFLICT" as ErrorCode, message, details, 409),

  internal: (message: string = "Internal server error") =>
    new ApiErrorImpl("INTERNAL_ERROR" as ErrorCode, message, undefined, 500),

  custom: (code: ErrorCode, message: string, details?: unknown, statusCode?: number) =>
    new ApiErrorImpl(code, message, details, statusCode),
};
