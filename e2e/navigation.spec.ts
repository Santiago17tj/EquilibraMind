import { test, expect } from "@playwright/test";
import { openDemo, openEspacio, openSection } from "./helpers";

test.describe("Navegación y menús", () => {
  test("la cabecera recorre las cinco secciones y marca la activa", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Está bien hacer una pausa");

    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    const steps: [string, RegExp][] = [
      ["Mi bienestar", /¿Cómo te has sentido últimamente\?/],
      ["Profesionales", /Cada historia merece ser escuchada/],
      ["Para empresas", /El bienestar de tu equipo/],
      ["Planes", /Elige cómo empezar/],
      ["Inicio", /Está bien hacer una pausa/]
    ];

    for (const [label, heading] of steps) {
      await nav.getByRole("button", { name: label, exact: true }).click();
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
      await expect(nav.getByRole("button", { name: label, exact: true })).toHaveAttribute(
        "aria-current",
        "page"
      );
    }
  });

  test("el logotipo vuelve al inicio y el foco va al contenido", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Planes");
    await page.getByRole("button", { name: "Volver al inicio" }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Está bien hacer una pausa");
    await expect(page.locator("main#contenido")).toBeFocused();
  });

  test("el pie de página abre Mi espacio y Probar roles", async ({ page }) => {
    await page.goto("/");
    await openEspacio(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("tu momento de calma");

    await openDemo(page);
    await expect(page.getByRole("heading", { name: /Una plataforma,/ })).toBeVisible();

    await page.locator("footer").getByRole("button", { name: "Chequeo de bienestar" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("¿Cómo te has sentido");
  });

  test("en escritorio no se muestran controles exclusivos de móvil", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
    await expect(page.locator(".mobile-quick-nav")).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
  });

  test.describe("menú móvil", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("abre, navega y se cierra al elegir una sección", async ({ page }) => {
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: "Navegación principal" });
      await expect(nav).toBeHidden();

      const toggle = page.getByRole("button", { name: "Abrir menú" });
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(nav).toBeVisible();
      await expect(page.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute(
        "aria-expanded",
        "true"
      );

      await nav.getByRole("button", { name: "Profesionales", exact: true }).click();
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Cada historia");
      await expect(nav).toBeHidden();
    });

    test("Escape cierra el menú móvil", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Abrir menú" }).click();
      const nav = page.getByRole("navigation", { name: "Navegación principal" });
      await expect(nav).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(nav).toBeHidden();
    });

    test("la barra de accesos rápidos navega a Inicio, Citas y Recorrido", async ({ page }) => {
      await page.goto("/");
      const quick = page.getByRole("navigation", { name: "Accesos rápidos" });
      await expect(quick).toBeVisible();

      await quick.getByRole("button", { name: /Citas/ }).click();
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Cada historia");

      await quick.getByRole("button", { name: /Inicio/ }).click();
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Está bien hacer una pausa");

      await quick.getByRole("button", { name: /Recorrido/ }).click();
      await expect(page.getByRole("complementary", { name: "Guía interactiva de la demostración" })).toBeVisible();
    });
  });
});
