import { test, expect } from "@playwright/test";
import { futureDate, openDemo, openSection } from "./helpers";

test.describe("v0.7 — composición visual y comunicación", () => {
  test("a 1440 px el cuestionario no mantiene una altura mínima rígida", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await openSection(page, "Mi bienestar");
    await expect(page.locator(".quiz-panel")).toHaveCSS("min-height", "0px");
    await expect(page.locator(".quiz-panel h2")).toBeVisible();
  });

  test("a 768 px el tercer profesional y la tercera estadística aprovechan el ancho", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await openSection(page, "Profesionales");

    const cards = page.locator(".specialist-grid > .specialist-card");
    await expect(cards).toHaveCount(3);
    const firstBox = await cards.nth(0).boundingBox();
    const lastBox = await cards.nth(2).boundingBox();
    expect(firstBox).not.toBeNull();
    expect(lastBox).not.toBeNull();
    expect(lastBox!.width).toBeGreaterThan(firstBox!.width * 1.5);

    await openDemo(page);
    const stats = page.locator(".role-stat-grid > .role-stat");
    await expect(stats).toHaveCount(3);
    const firstStat = await stats.nth(0).boundingBox();
    const lastStat = await stats.nth(2).boundingBox();
    expect(firstStat).not.toBeNull();
    expect(lastStat).not.toBeNull();
    expect(lastStat!.width).toBeGreaterThan(firstStat!.width * 1.5);
  });

  test("el recorrido empresarial comunica etapas y la reserva explica la fecha en español", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await openSection(page, "Para empresas");

    const journey = page.locator(".company-journey");
    await expect(journey.getByRole("heading", { name: /Del interés por el bienestar/ })).toBeVisible();
    await expect(journey.locator("ol > li")).toHaveCount(3);
    await expect(journey).toContainText("no representa un servicio actualmente contratado");

    await openSection(page, "Profesionales");
    const helper = page.locator("#booking-date-description");
    await expect(helper).toContainText("formato de tu navegador");
    const selected = await futureDate(page, 35);
    await page.locator("#date").fill(selected);
    await expect(helper).toContainText("Fecha seleccionada:");
    await expect(helper).toContainText(selected.slice(0, 4));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("Mi espacio presenta tres ideas opcionales y conserva la agenda de demostración", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("button", { name: "Mi espacio de prueba" }).click();
    const ritual = page.locator(".space-ritual");
    await expect(ritual.getByRole("heading", { name: "Pequeños pasos para hoy" })).toBeVisible();
    await expect(ritual.locator("ol > li")).toHaveCount(3);
    await expect(page.locator(".space-card").getByText("Mi cita de demostración")).toBeVisible();
  });
});
