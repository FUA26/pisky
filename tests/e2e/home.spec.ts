import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Pisky/);
  });

  test("should have main heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });
});

test.describe("API Health", () => {
  test("should return healthy status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("healthy");
  });
});

test.describe("API Users", () => {
  test("should list users", async ({ request }) => {
    const response = await request.get("/api/users");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("should validate email format on create", async ({ request }) => {
    const response = await request.post("/api/users", {
      data: { email: "invalid-email", name: "Test" },
    });
    expect(response.status()).toBe(422);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

test.describe("Authentication", () => {
  test("should redirect unauthenticated users from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should show sign-in page", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("h1")).toContainText("Sign In");
  });
});
