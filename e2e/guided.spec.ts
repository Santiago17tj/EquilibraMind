import { test, expect } from "@playwright/test";
import { openSection } from "./helpers";

test.describe("Recorridos guiados", () => {
  test("el recorrido para personas avanza por sus seis pasos y finaliza", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Ver recorrido", exact: true }).click();

    const guide = page.getByRole("complementary", { name: "Guía interactiva de la demostración" });
    await expect(guide).toBeVisible();
    await expect(guide).toContainText("RECORRIDO PERSONAL");
    await expect(guide).toContainText("PASO 1 DE 6");
    await expect(guide).toContainText("Bienvenido a EquilibraMind");

    const expectations = [
      /Reconocer cómo nos sentimos/,
      /Conocer opciones de acompañamiento/,
      /Simular una reserva/,
      /Mi espacio personal/,
      /Tres perspectivas conectadas/
    ];
    for (const [index, text] of expectations.entries()) {
      await guide.getByRole("button", { name: /Siguiente paso/ }).click();
      await expect(guide).toContainText(`PASO ${index + 2} DE 6`);
      await expect(guide).toContainText(text);
      if (text.source.includes("Simular una reserva")) {
        await expect(page.locator("#booking-panel")).toBeVisible();
      }
    }

    await guide.getByRole("button", { name: /Finalizar/ }).click();
    await expect(guide).toBeHidden();
  });

  test("el recorrido para empresas muestra el panel y la vista administrativa", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Para empresas");
    await page.getByRole("button", { name: /Presentar propuesta B2B/ }).click();

    const guide = page.getByRole("complementary", { name: "Guía interactiva de la demostración" });
    await expect(guide).toContainText("RECORRIDO PARA EMPRESAS");
    await expect(guide).toContainText("El reto del bienestar organizacional");

    await guide.getByRole("button", { name: /Siguiente paso/ }).click();
    await expect(guide).toContainText("La propuesta para empresas");

    await guide.getByRole("button", { name: /Siguiente paso/ }).click();
    await expect(guide).toContainText("Indicadores agregados simulados");
    await expect(page.locator("#company-dashboard")).toBeVisible();

    await guide.getByRole("button", { name: /Siguiente paso/ }).click();
    await expect(guide).toContainText("Cómo funcionaría el negocio");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Elige cómo empezar");

    await guide.getByRole("button", { name: /Siguiente paso/ }).click();
    await expect(guide).toContainText("PASO 5 DE 5");
    await expect(page.getByText("VISTA DE ADMINISTRADOR")).toBeVisible();

    await guide.getByRole("button", { name: /Finalizar/ }).click();
    await expect(guide).toBeHidden();
  });

  test("Atrás y Escape funcionan en el recorrido", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Ver recorrido", exact: true }).click();
    const guide = page.getByRole("complementary", { name: "Guía interactiva de la demostración" });

    await expect(guide.getByRole("button", { name: /Atrás/ })).toBeDisabled();
    await guide.getByRole("button", { name: /Siguiente paso/ }).click();
    await expect(guide).toContainText("PASO 2 DE 6");
    await guide.getByRole("button", { name: /Atrás/ }).click();
    await expect(guide).toContainText("PASO 1 DE 6");

    await page.keyboard.press("Escape");
    await expect(guide).toBeHidden();
  });

  test("se puede saltar a un paso con los indicadores de progreso", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Ver recorrido", exact: true }).click();
    const guide = page.getByRole("complementary", { name: "Guía interactiva de la demostración" });

    await guide.getByRole("button", { name: /Ir al paso 5: Mi espacio personal/ }).click();
    await expect(guide).toContainText("PASO 5 DE 6");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("tu momento de calma");
  });
});
