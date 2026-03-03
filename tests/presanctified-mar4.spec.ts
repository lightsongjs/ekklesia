import { test, expect } from "playwright/test";

test.describe("Presanctified Liturgy — 4 March 2026 (Sf. Gherasim)", () => {
  test("page loads and has correct title", async ({ page }) => {
    await page.goto("/presanctified/2026-03-04");
    await expect(page).toHaveTitle(/Liturghia Darurilor.*4 martie 2026/);
  });

  test("contains saint stihiri from Mineion (not placeholders)", async ({
    page,
  }) => {
    await page.goto("/presanctified/2026-03-04");
    const body = page.locator("body");

    // Should NOT contain placeholder text
    await expect(body).not.toContainText("de completat");

    // Should contain Sf. Conon stihiri from Mineion (5 martie, not 4 martie)
    await expect(body).toContainText("Mucenice pururea slăvite cu multe scârbe");
    await expect(body).toContainText("Conone pururea preaslăvite");
    await expect(body).toContainText("Conone vrednicule de minune");

    // Should contain Născătoarea from Minei
    await expect(body).toContainText("Bucură-te Curată străină auzire");
  });

  test("has all main liturgical sections", async ({ page }) => {
    await page.goto("/presanctified/2026-03-04");

    const expectedSections = [
      "Începutul",
      "Psalmul 103",
      "Ectenia Mare",
      "Catisma 18",
      "Doamne strigat-am",
      "Vohodul",
      "Prochimenul 1",
      "Paremia 1",
      "Prochimenul 2",
      "Paremia 2",
      "Să se îndrepteze",
      "Ectenia cererilor stăruitoare",
      "Ectenia catehumenilor",
      "Acum Puterile cerești",
      "Ectenia cererilor",
      "Tatăl nostru",
      "Împărtășirea",
      "După Împărtășire",
      "Psalmul 33",
      "Otpustul",
    ];

    for (const section of expectedSections) {
      await expect(page.locator("body")).toContainText(section);
    }
  });

  test("has paremii content (Facere and Pilde)", async ({ page }) => {
    await page.goto("/presanctified/2026-03-04");
    const body = page.locator("body");

    await expect(body).toContainText("a ieşit Cain de la faţa lui Dumnezeu");
    await expect(body).toContainText("Fiule, bea apă din vasele tale");
  });

  test("does NOT have ectenia luminării (only from week 4)", async ({
    page,
  }) => {
    await page.goto("/presanctified/2026-03-04");
    // Week 2 — no ectenia luminării
    await expect(page.locator("body")).not.toContainText(
      "celor ce vin spre luminare",
    );
  });
});
