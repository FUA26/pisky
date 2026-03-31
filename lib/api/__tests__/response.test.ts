import { describe, it, expect } from "vitest";
import {
  success,
  created,
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  internalError,
  paginated,
} from "../response";
import { HttpStatus, ErrorCode } from "../../types/api-response";

describe("Response Helpers", () => {
  describe("success", () => {
    it("should create a success response with default status", () => {
      const response = success({ message: "Hello" });
      expect(response.status).toBe(HttpStatus.OK);
    });

    it("should create a success response with custom status", () => {
      const response = success({ message: "Created" }, HttpStatus.CREATED);
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it("should include meta data when provided", async () => {
      const response = success({ data: "test" }, HttpStatus.OK, {
        page: 1,
        limit: 10,
      });
      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: { data: "test" },
        meta: { page: 1, limit: 10 },
      });
    });
  });

  describe("created", () => {
    it("should create a response with 201 status", () => {
      const response = created({ id: "123" });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe("ok", () => {
    it("should create a 200 OK response", () => {
      const response = ok({ data: "test" });
      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  describe("error responses", () => {
    it("should create bad request response", () => {
      const response = badRequest("Invalid input");
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should create unauthorized response", () => {
      const response = unauthorized();
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it("should create forbidden response", () => {
      const response = forbidden();
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it("should create not found response", () => {
      const response = notFound("User");
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it("should create conflict response", () => {
      const response = conflict();
      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it("should create validation error response", () => {
      const response = validationError([{ field: "email", message: "Invalid" }]);
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it("should create internal error response", () => {
      const response = internalError();
      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe("paginated", () => {
    it("should create a paginated response", async () => {
      const items = [{ id: "1" }, { id: "2" }];
      const response = paginated(items, 10, 1, 10);

      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: {
          items,
          meta: {
            page: 1,
            limit: 10,
            total: 10,
            totalPages: 1,
            hasMore: false,
          },
        },
      });
    });

    it("should calculate hasMore correctly", async () => {
      const items = [{ id: "1" }, { id: "2" }];
      const response = paginated(items, 20, 1, 10);

      const json = await response.json();
      expect(json.data.meta.hasMore).toBe(true);
      expect(json.data.meta.totalPages).toBe(2);
    });
  });
});
