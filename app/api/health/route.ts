import { success } from "@/shared/api/response";
import type { NextRequest } from "next/server";

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };

  return success(health);
}
