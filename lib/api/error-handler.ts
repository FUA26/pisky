import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, ErrorCode, HttpStatus, type ApiResponse } from "../types/api-response";

/**
 * Configuration for error handler
 */
interface ErrorHandlerConfig {
  includeStack?: boolean; // Include stack trace in error response
  logErrors?: boolean; // Log errors to console
}

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  includeStack: process.env.NODE_ENV === "development",
  logErrors: true,
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for Zod errors
 */
export class ValidationError extends AppError {
  constructor(public zodError: z.ZodError) {
    super(
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      HttpStatus.UNPROCESSABLE_ENTITY,
      zodError.issues
    );
    this.name = "ValidationError";
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, HttpStatus.NOT_FOUND);
    this.name = "NotFoundError";
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(ErrorCode.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    this.name = "UnauthorizedError";
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(ErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN);
    this.name = "ForbiddenError";
  }
}

/**
 * Conflict error
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(ErrorCode.CONFLICT, message, HttpStatus.CONFLICT);
    this.name = "ConflictError";
  }
}

/**
 * Convert error to ApiError format
 */
function errorToApiError(error: unknown, config: ErrorHandlerConfig): ApiError {
  // AppError instances
  if (error instanceof AppError) {
    const apiError: ApiError = {
      code: error.code,
      message: error.message,
    };
    if (error.details) {
      apiError.details = error.details;
    }
    if (config.includeStack && error.stack) {
      apiError.stack = error.stack;
    }
    return apiError;
  }

  // Zod validation errors
  if (error instanceof z.ZodError) {
    return {
      code: ErrorCode.VALIDATION_ERROR,
      message: "Validation failed",
      details: error.issues,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    const apiError: ApiError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: config.includeStack ? error.message : "An unexpected error occurred",
    };
    if (config.includeStack && error.stack) {
      apiError.stack = error.stack;
    }
    return apiError;
  }

  // Unknown error type
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: "An unexpected error occurred",
  };
}

/**
 * Get status code from error
 */
function getStatusCode(error: unknown): HttpStatus {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  if (error instanceof z.ZodError) {
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

/**
 * Log error to console
 */
function logError(error: unknown, apiError: ApiError): void {
  console.error("[API Error]", {
    code: apiError.code,
    message: apiError.message,
    details: apiError.details,
  });
}

/**
 * Handle API errors and return appropriate response
 */
export function handleError(
  error: unknown,
  config: ErrorHandlerConfig = DEFAULT_CONFIG
): NextResponse<ApiResponse<never>> {
  const apiError = errorToApiError(error, config);
  const statusCode = getStatusCode(error);

  if (config.logErrors) {
    logError(error, apiError);
  }

  return NextResponse.json(
    {
      success: false,
      error: apiError,
    } satisfies ApiResponse<never>,
    { status: statusCode }
  );
}

/**
 * Async handler wrapper that catches errors
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>,
  config?: ErrorHandlerConfig
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch((error) => handleError(error, config));
}

/**
 * Try-catch wrapper for route handlers
 */
export function catchAsync<T extends Record<string, unknown>, Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse<ApiResponse<T>>>,
  config?: ErrorHandlerConfig
) {
  return async (...args: Args): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error, config);
    }
  };
}
