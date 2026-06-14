import { test, expect } from "@playwright/test";

// Rauchtest: Die zentralen öffentlichen Seiten müssen erreichbar sein.
const pages = [
  { path: "/de", heading: /LTS|Logistik|Transport/i },
  { path: "/de/karriere", heading: /.+/ },
  { path: "/de/kontakt", heading: /.+/ },
  { path: "/de/fuhrpark", heading: /.+/ }
];

for (const page of pages) {
  test(`Seite ${page.path} lädt`, async ({ page: browserPage }) => {
    const response = await browserPage.goto(page.path);
    expect(response?.status(), `Status für ${page.path}`).toBeLessThan(400);
    await expect(browserPage.locator("h1").first()).toBeVisible();
  });
}

test("Footer enthält Rechtslinks", async ({ page }) => {
  await page.goto("/de");
  await expect(page.getByRole("link", { name: /Impressum/i })).toBeVisible();
});

test("jobs.xml liefert XML", async ({ request }) => {
  const response = await request.get("/jobs.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
});
