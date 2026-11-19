import { test, expect } from "@playwright/test";
import { openDemo, openSection } from "./helpers";

const portraits = [
  { name: "Laura Méndez", file: "laura-v06.avif" },
  { name: "Daniela Ríos", file: "daniela-v06.avif" },
  { name: "Julián Herrera", file: "julian.avif" }
];

test.describe("Perfiles de profesionales y retratos", () => {
  test("se muestran tres perfiles ficticios con retratos distintos y cargados", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");

    const cards = page.locator(".specialist-card");
    await expect(cards).toHaveCount(3);
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>(".specialist-generated-photo")).every(
        (image) => image.complete && image.naturalWidth > 0
      )
    );

    const sources = await page
      .locator(".specialist-generated-photo")
      .evaluateAll((images) => images.map((image) => (image as HTMLImageElement).getAttribute("src") ?? ""));
    expect(new Set(sources).size).toBe(3);

    for (const portrait of portraits) {
      const card = cards.filter({ hasText: portrait.name });
      await expect(card).toHaveCount(1);
      const image = card.locator(".specialist-generated-photo");
      await expect(image).toHaveAttribute("src", new RegExp(portrait.file.replace(".", "\\.")));
      const dimensions = await image.evaluate((element) => {
        const imageElement = element as HTMLImageElement;
        return { width: imageElement.naturalWidth, height: imageElement.naturalHeight };
      });
      expect(dimensions.width).toBeGreaterThanOrEqual(800);
      expect(dimensions.height).toBeGreaterThanOrEqual(800);
      await expect(card).toContainText("PERSONAJE FICTICIO · IA");
    }

    for (const portrait of portraits) {
      const response = await page.request.get(`/images/${portrait.file}`);
      expect(response.ok(), `${portrait.file} debe responder 200`).toBeTruthy();
      expect(response.headers()["content-type"]).toContain("image/");
    }
  });

  test("los filtros por enfoque reducen la lista correctamente", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");

    await page.getByRole("button", { name: "Estrés laboral", exact: true }).click();
    await expect(page.getByRole("button", { name: "Estrés laboral", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(page.locator(".specialist-card")).toHaveCount(2);
    await expect(page.locator(".specialist-card").filter({ hasText: "Daniela Ríos" })).toHaveCount(0);

    await page.getByRole("button", { name: "Vida estudiantil", exact: true }).click();
    await expect(page.locator(".specialist-card")).toHaveCount(1);
    await expect(page.locator(".specialist-card")).toContainText("Daniela Ríos");

    await page.getByRole("button", { name: "Todos los enfoques", exact: true }).click();
    await expect(page.locator(".specialist-card")).toHaveCount(3);
  });

  test("Ver perfil abre y cierra la ficha ampliada", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");

    const laura = page.locator(".specialist-card").filter({ hasText: "Laura Méndez" });
    await laura.getByRole("button", { name: /Ver perfil/ }).click();

    const detail = page.locator("#profile-detail");
    await expect(detail).toBeVisible();
    await expect(detail.getByRole("heading", { level: 2, name: "Laura Méndez" })).toBeVisible();
    await expect(detail).toContainText("Sobre este enfoque");
    await expect(detail).toContainText("Áreas de acompañamiento");
    await expect(detail).toContainText("No representan profesionales reales");

    await detail.getByRole("button", { name: "Cerrar ficha" }).click();
    await expect(detail).toHaveCount(0);
  });

  test("Agendar demo selecciona al profesional en el formulario", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");

    const daniela = page.locator(".specialist-card").filter({ hasText: "Daniela Ríos" });
    await daniela.getByRole("button", { name: /Agendar demo/ }).click();

    await expect(page.locator("#professional")).toHaveValue("2");
    await expect(page.locator(".booking-person")).toContainText("Daniela Ríos");
    await expect(page.locator("#booking-panel")).toBeInViewport();
  });

  test("el diagnóstico local valida IndexedDB y los tres retratos", async ({ page }) => {
    await page.goto("/");
    await openDemo(page);

    await page.getByRole("button", { name: /Verificar demo en este navegador/ }).click();
    const results = page.locator(".demo-healthcheck-results");
    await expect(results).toContainText("4 de 4 comprobaciones correctas");
    await expect(page.locator(".demo-healthcheck-item.ok")).toHaveCount(4);
    await expect(results).toContainText("Base local IndexedDB");
    await expect(results).toContainText("Consistencia de reservas");
    await expect(results).toContainText("Resolución de retratos");
    await expect(results).toContainText("Contenido visual distinto");
  });
});
