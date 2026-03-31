import { NextResponse } from "next/server";
import {
  HttpStatus,
  type ApiResponse,
  type ApiError,
  type ResponseMeta,
  type PaginatedData,
  type PaginationOptions,
} from "../types/api-response";

/**
 * Create a successful API response
 */
export function success<T>(
  data: T,
  statusCode: HttpStatus = HttpStatus.OK,
  meta?: ResponseMeta
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    } satisfies ApiResponse<T>,
    { status: statusCode }
  );
}

/**
 * Create a successful response with created status
 */
export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return success(data, HttpStatus.CREATED);
}

/**
 * Create a successful response with no content
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: HttpStatus.NO_CONTENT });
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  const apiError: ApiError = {
    code,
    message,
    ...(details && { details }),
  };

  return NextResponse.json(
    {
      success: false,
      error: apiError,
    } satisfies ApiResponse<never>,
    { status: statusCode }
  );
}

/**
 * Create a paginated response
 */
export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): NextResponse<ApiResponse<PaginatedData<T>>> {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return success({
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  });
}

/**
 * Create a paginated response from options
 */
export function paginatedFromOptions<T>(
  items: T[],
  total: number,
  options: Required<PaginationOptions>
): NextResponse<ApiResponse<PaginatedData<T>>> {
  return paginated(items, total, options.page, options.limit);
}

/**
 * Quick success response
 */
export const ok = <T>(data: T) => success(data, HttpStatus.OK);

/**
 * Quick bad request response
 */
export const badRequest = (message: string = "Bad request", details?: unknown) =>
  errorResponse("BAD_REQUEST", message, HttpStatus.BAD_REQUEST, details);

/**
 * Quick unauthorized response
 */
export const unauthorized = (message: string = "Unauthorized") =>
  errorResponse("UNAUTHORIZED", message, HttpStatus.UNAUTHORIZED);

/**
 * Quick forbidden response
 */
export const forbidden = (message: string = "Forbidden") =>
  errorResponse("FORBIDDEN", message, HttpStatus.FORBIDDEN);

/**
 * Quick not found response
 */
export const notFound = (resource: string = "Resource") =>
  errorResponse("NOT_FOUND", `${resource} not found`, HttpStatus.NOT_FOUND);

/**
 * Quick conflict response
 */
export const conflict = (message: string = "Conflict") =>
  errorResponse("CONFLICT", message, HttpStatus.CONFLICT);

/**
 * Quick validation error response
 */
export const validationError = (details: unknown) =>
  errorResponse("VALIDATION_ERROR", "Validation failed", HttpStatus.UNPROCESSABLE_ENTITY, details);

/**
 * Quick internal server error response
 */
export const internalError = (message: string = "Internal server error") =>
  errorResponse("INTERNAL_ERROR", message, HttpStatus.INTERNAL_SERVER_ERROR);

/**
 * Response builder class for chaining
 */
export class ResponseBuilder<T = unknown> {
  private statusCode: HttpStatus = HttpStatus.OK;
  private meta?: ResponseMeta;
  private data?: T;

  withData(data: T): this {
    this.data = data;
    return this;
  }

  withMeta(meta: ResponseMeta): this {
    this.meta = meta;
    return this;
  }

  withStatus(statusCode: HttpStatus): this {
    this.statusCode = statusCode;
    return this;
  }

  build(): NextResponse<ApiResponse<T>> {
    if (!this.data) {
      throw new Error("Data is required. Use withData() to set it.");
    }
    return success(this.data, this.statusCode, this.meta);
  }
}

/**
 * Create a response builder
 */
export function buildResponse<T>() {
  return new ResponseBuilder<T>();
}
