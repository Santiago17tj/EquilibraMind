import { test, expect } from "@playwright/test";
import { openDemo, openEspacio, openSection } from "./helpers";

const sections = [
  { label: "Inicio", heading: /Está bien hacer una pausa/ },
  { label: "Mi bienestar", heading: /¿Cómo te has sentido/ },
  { label: "Profesionales", heading: /Cada historia merece ser escuchada/ },
  { label: "Para empresas", heading: /El bienestar de tu equipo/ },
  { label: "Planes", heading: /Elige cómo empezar/ }
] as const;

test.describe("Accesibilidad básica", () => {
  test("el documento declara español y cada vista tiene un solo h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    for (const section of sections) {
      await openSection(page, section.label);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(section.heading);
      expect(await page.locator("main h1").count()).toBe(1);
    }

    await openEspacio(page);
    expect(await page.locator("main h1").count()).toBe(1);

    await openDemo(page);
    expect(await page.locator("main h1").count()).toBe(1);
  });

  test("el enlace Saltar al contenido recibe foco y lleva al contenido principal", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skip = page.getByRole("link", { name: "Saltar al contenido principal" });
    await expect(skip).toBeFocused();
    expect(await skip.evaluate((element) => window.getComputedStyle(element).top)).toBe("0px");

    await page.keyboard.press("Enter");
    await expect(page.locator("main#contenido")).toBeFocused();
  });

  test("los controles de la cabecera muestran un foco visible con teclado", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const outline = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element) return null;
      const style = window.getComputedStyle(element);
      return {
        tag: element.tagName,
        text: element.textContent?.trim() ?? "",
        style: style.outlineStyle,
        width: style.outlineWidth,
        offset: style.outlineOffset
      };
    });
    expect(outline).not.toBeNull();
    expect(outline!.tag).toBe("BUTTON");
    expect(outline!.style).toBe("solid");
    expect(parseFloat(outline!.width)).toBeGreaterThanOrEqual(3);
    expect(outline!.offset).not.toBe("0px");
  });

  test("no hay controles visibles sin nombre accesible", async ({ page }) => {
    await page.goto("/");
    for (const section of sections) {
      await openSection(page, section.label);
      const unnamed = await page.evaluate(() => {
        const controls = Array.from(
          document.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea")
        );
        return controls
          .filter((element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
          })
          .filter((element) => {
            if (element instanceof HTMLInputElement && element.type === "hidden") return false;
            const labelled =
              element.getAttribute("aria-label") ??
              (element as HTMLInputElement).labels?.[0]?.textContent ??
              element.getAttribute("title") ??
              element.textContent ??
              "";
            return labelled.trim().length === 0;
          })
          .map((element) => element.outerHTML.slice(0, 160));
      });
      expect(unnamed, `controles sin nombre en ${section.label}`).toEqual([]);
    }
  });

  test("todas las imágenes declaran texto alternativo", async ({ page }) => {
    await page.goto("/");
    for (const section of sections) {
      await openSection(page, section.label);
      expect(await page.locator("main img:not([alt])").count()).toBe(0);
    }
    await openEspacio(page);
    expect(await page.locator("main img:not([alt])").count()).toBe(0);
    await openDemo(page);
    expect(await page.locator("main img:not([alt])").count()).toBe(0);
  });

  test("Escape cierra el recorrido guiado", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Ver recorrido", exact: true }).click();
    const guide = page.getByRole("complementary", { name: "Guía interactiva de la demostración" });
    await expect(guide).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(guide).toBeHidden();
  });

  test("Reducir movimiento desactiva animaciones y revelados", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.locator(".page-transition")).toHaveCSS("animation-name", "none");
    await page.evaluate(() => window.scrollTo(0, 1800));
    await page.waitForTimeout(400);
    expect(await page.locator(".reveal-on-scroll").count()).toBe(0);

    await page.locator("header").getByRole("button", { name: "Ver recorrido", exact: true }).click();
    const guide = page.getByRole("complementary", { name: "Guía interactiva de la demostración" });
    await expect(guide).toHaveCSS("animation-name", "none");
  });
});
