import { test, expect } from "@playwright/test";
import { openSection } from "./helpers";

async function answerAll(
  page: import("@playwright/test").Page,
  option: string,
  start = 0
) {
  for (let index = start; index < 6; index += 1) {
    await expect(page.getByRole("progressbar", { name: "Progreso del chequeo" })).toHaveAttribute(
      "aria-valuenow",
      String(index)
    );
    await page.getByRole("button", { name: option, exact: true }).click();
    await expect(page.getByRole("button", { name: option, exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    const label = index === 5 ? /Ver mi reflexión/ : /Continuar/;
    await page.getByRole("button", { name: label }).click();
  }
}

test.describe("Cuestionario de bienestar", () => {
  test("avanza, retrocede y muestra una reflexión educativa sin diagnóstico", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Mi bienestar");

    const progress = page.getByRole("progressbar", { name: "Progreso del chequeo" });
    await expect(progress).toHaveAttribute("aria-valuenow", "0");
    await expect(page.getByText("PREGUNTA 1 DE 6")).toBeVisible();
    await expect(page.getByRole("button", { name: /Anterior/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Continuar/ })).toBeDisabled();

    await page.getByRole("button", { name: "Algunas veces", exact: true }).click();
    await page.getByRole("button", { name: /Continuar/ }).click();
    await expect(progress).toHaveAttribute("aria-valuenow", "1");

    await page.getByRole("button", { name: /Anterior/ }).click();
    await expect(progress).toHaveAttribute("aria-valuenow", "0");
    await expect(page.getByRole("button", { name: "Algunas veces", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await page.getByRole("button", { name: /Continuar/ }).click();
    await answerAll(page, "Casi siempre", 1);

    const result = page.locator(".quiz-result");
    await expect(result).toBeVisible();
    await expect(result).toContainText("Vale la pena prestar atención a tu bienestar");
    await expect(result).toContainText("sin validación psicométrica");
    await expect(result).toContainText("No mide ni diagnostica burnout");
  });

  test("una puntuación baja muestra la orientación de autocuidado", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Mi bienestar");
    await answerAll(page, "Nunca");
    await expect(page.locator(".quiz-result")).toContainText(
      "Una oportunidad para seguir cuidándote"
    );
  });

  test("el chequeo no guarda respuestas ni sobrevive a una recarga", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Mi bienestar");
    await answerAll(page, "Casi siempre");
    await expect(page.locator(".quiz-result")).toBeVisible();

    await page.reload();
    await openSection(page, "Mi bienestar");
    await expect(page.getByText("PREGUNTA 1 DE 6")).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Progreso del chequeo" })).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });

  test("el botón Repetir ejercicio reinicia el cuestionario", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Mi bienestar");
    await answerAll(page, "Nunca");
    await page.getByRole("button", { name: "Repetir ejercicio" }).click();
    await expect(page.getByText("PREGUNTA 1 DE 6")).toBeVisible();
    await expect(page.getByRole("button", { name: /Continuar/ })).toBeDisabled();
  });
});
