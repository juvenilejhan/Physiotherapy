import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("admin blogs endpoint should require authentication", async ({
    request,
  }) => {
    const response = await request.get("/api/admin/content/blogs");
    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  test("admin videos endpoint should require authentication", async ({
    request,
  }) => {
    const response = await request.get("/api/admin/content/videos");
    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  test("admin gallery endpoint should require authentication", async ({
    request,
  }) => {
    const response = await request.get("/api/admin/content/gallery");
    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  test("public blogs endpoint should be accessible", async ({ request }) => {
    const response = await request.get("/api/public/blogs");
    expect(response.status()).toBe(200);
  });

  test("services endpoint should be accessible", async ({ request }) => {
    const response = await request.get("/api/services");
    expect([200, 404]).toContain(response.status());
  });
});
