import { test, expect } from "@playwright/test";
import { openSection } from "./helpers";

test.describe("Ejercicio interactivo de respiración", () => {
  test("inicia, cuenta, pausa, reinicia y completa el minuto", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");

    const widget = page.locator(".breathing-widget").first();
    await widget.scrollIntoViewIfNeeded();
    await expect(widget.getByRole("progressbar", { name: "Progreso del ejercicio" })).toHaveAttribute(
      "aria-valuenow",
      "0"
    );

    await widget.getByRole("button", { name: /Comenzar/ }).click();
    await expect(widget.getByRole("button", { name: /Pausar/ })).toBeVisible();
    await expect(widget.locator(".breathing-time")).toContainText("00:00");

    await page.clock.fastForward(1200);
    await expect(widget.locator(".breathing-time")).toContainText("00:01");
    await expect(widget.getByRole("progressbar", { name: "Progreso del ejercicio" })).toHaveAttribute(
      "aria-valuenow",
      "1"
    );

    await widget.getByRole("button", { name: /Pausar/ }).click();
    await expect(widget.getByRole("button", { name: /Continuar/ })).toBeVisible();
    await page.clock.fastForward(3000);
    await expect(widget.locator(".breathing-time")).toContainText("00:01");

    await widget.getByRole("button", { name: "Reiniciar ejercicio" }).click();
    await expect(widget.locator(".breathing-time")).toContainText("00:00");
    await expect(widget.getByRole("button", { name: /Comenzar/ })).toBeVisible();

    await widget.getByRole("button", { name: /Comenzar/ }).click();
    await page.clock.runFor(60_000);
    await expect(widget.getByRole("progressbar", { name: "Progreso del ejercicio" })).toHaveAttribute(
      "aria-valuenow",
      "60"
    );
    await expect(widget.locator(".breath-core strong")).toHaveText("Bien hecho");
    await expect(widget.locator(".breathing-time")).toContainText("01:00");
    const repeat = widget.getByRole("button", { name: /Repetir ejercicio/ });
    await expect(repeat).toBeVisible();

    await repeat.click();
    await expect(widget.getByRole("button", { name: /Pausar/ })).toBeVisible();
    await expect(widget.locator(".breathing-time")).toContainText("00:00");
  });

  test("respeta la preferencia de movimiento reducido", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const widget = page.locator(".breathing-widget").first();
    await widget.scrollIntoViewIfNeeded();
    await widget.getByRole("button", { name: /Comenzar/ }).click();
    await expect(widget.getByRole("button", { name: /Pausar/ })).toBeVisible();

    const animation = await widget.locator(".breath-core").evaluate((element) => {
      const style = window.getComputedStyle(element);
      return { name: style.animationName, duration: style.animationDuration };
    });
    expect(animation.name).toBe("none");
  });

  test("el widget compacto de Mi espacio funciona de forma independiente", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    await page.locator("footer").getByRole("button", { name: "Mi espacio de prueba" }).click();

    const widget = page.locator(".breathing-compact");
    await expect(widget).toBeVisible();
    await widget.getByRole("button", { name: /Comenzar/ }).click();
    await expect(widget.getByRole("button", { name: /Pausar/ })).toBeVisible();
    await page.clock.fastForward(1200);
    await widget.getByRole("button", { name: /Pausar/ }).click();
    await expect(widget.getByRole("button", { name: /Continuar/ })).toBeVisible();
  });
});
