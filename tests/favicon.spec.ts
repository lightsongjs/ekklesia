import { test, expect } from "playwright/test";

test("favicon link tag is present in the page head", async ({ page }) => {
  await page.goto("/");
  const faviconLink = page.locator('link[rel="icon"]');
  await expect(faviconLink).toHaveAttribute("href", "/favicon.svg");
  await expect(faviconLink).toHaveAttribute("type", "image/svg+xml");
});

test("favicon.svg is served and returns valid SVG", async ({ request }) => {
  const response = await request.get("/favicon.svg");
  expect(response.status()).toBe(200);
  const contentType = response.headers()["content-type"];
  expect(contentType).toContain("svg");
  const body = await response.text();
  expect(body).toContain("<svg");
  expect(body).toContain("</svg>");
});
