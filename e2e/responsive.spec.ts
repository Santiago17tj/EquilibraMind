import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { openDemo, openEspacio, openSection, type SectionLabel } from "./helpers";

const viewports = [
  { name: "movil-375", width: 375, height: 812 },
  { name: "tableta-768", width: 768, height: 1024 },
  { name: "escritorio-1440", width: 1440, height: 900 }
];

const sections: { id: string; label: SectionLabel }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "chequeo", label: "Mi bienestar" },
  { id: "profesionales", label: "Profesionales" },
  { id: "empresas", label: "Para empresas" },
  { id: "planes", label: "Planes" }
];

const captureDir = path.resolve("docs/capturas");

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;

    // Recorre la página para activar las imágenes con loading="lazy".
    const step = Math.max(280, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    window.scrollTo(0, 0);

    await Promise.all(
      Array.from(document.images).map((image) => {
        if (image.complete) return Promise.resolve();
        image.loading = "eager";
        return new Promise<void>((resolve) => {
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          window.setTimeout(done, 3000);
        });
      })
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((element) => {
      element.classList.add("is-revealed");
    });
  });
}

async function expectNoHorizontalOverflow(page: Page, context: string): Promise<void> {
  const metrics = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    viewport: window.innerWidth
  }));
  expect(metrics.documentWidth, `desbordamiento horizontal en ${context}`).toBeLessThanOrEqual(
    metrics.viewport + 1
  );
  expect(metrics.bodyWidth, `desbordamiento del body en ${context}`).toBeLessThanOrEqual(
    metrics.viewport + 1
  );
}

async function capture(page: Page, viewport: string, section: string): Promise<void> {
  fs.mkdirSync(captureDir, { recursive: true });
  await page.screenshot({
    path: path.join(captureDir, `${viewport}-${section}.jpg`),
    fullPage: true,
    type: "jpeg",
    quality: 82,
    animations: "disabled",
    caret: "hide"
  });
}

for (const viewport of viewports) {
  test.describe(`Responsive ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("páginas principales sin desbordamiento horizontal y con capturas", async ({ page }) => {
      test.setTimeout(120_000);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await settle(page);

      for (const section of sections) {
        if (section.id !== "inicio") await openSection(page, section.label);
        await settle(page);
        await expectNoHorizontalOverflow(page, `${viewport.name}/${section.id}`);
        await capture(page, viewport.name, section.id);
      }

      await openEspacio(page);
      await settle(page);
      await expectNoHorizontalOverflow(page, `${viewport.name}/espacio`);
      await capture(page, viewport.name, "espacio");

      await openDemo(page);
      await settle(page);
      await expectNoHorizontalOverflow(page, `${viewport.name}/demo`);
      await capture(page, viewport.name, "demo");
    });

    test("el contenido clave permanece dentro del ancho visible", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      const fits = async (selector: string) => {
        const box = await page.locator(selector).first().boundingBox();
        expect(box, `${selector} debe tener caja`).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(-1);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
      };

      await fits(".hero-content");
      await fits(".header-inner");

      await openSection(page, "Profesionales");
      await fits(".booking-form");

      await openSection(page, "Planes");
      await fits(".plan-card");

      await openEspacio(page);
      await fits(".space-card");

      await openDemo(page);
      await fits(".role-dashboard");
    });

    test("la barra de accesos rápidos solo aparece en pantallas pequeñas", async ({ page }) => {
      await page.goto("/");
      const quick = page.locator(".mobile-quick-nav");
      if (viewport.width <= 800) {
        await expect(quick).toBeVisible();
        await expect(page.getByRole("button", { name: "Abrir menú" })).toBeVisible();
      } else {
        await expect(quick).toBeHidden();
        await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
      }
    });
  });
}

test.describe("Recorrido guiado en móvil", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("la guía cabe en pantalla y se puede cerrar", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: /Ver recorrido/ }).click();

    const guide = page.getByRole("complementary", { name: "Guía interactiva de la demostración" });
    const box = await guide.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    expect(box!.y + box!.height).toBeLessThanOrEqual(812);

    await expectNoHorizontalOverflow(page, "móvil/guía");
    await guide.getByRole("button", { name: "Cerrar recorrido guiado" }).click();
    await expect(guide).toBeHidden();
  });
});
