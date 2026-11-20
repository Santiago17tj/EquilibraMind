import { test, expect } from "@playwright/test";
import { bookDemo, futureDate, openDemo, openEspacio, readDb } from "./helpers";

test.describe("Persistencia en IndexedDB", () => {
  test("la reserva sobrevive a una recarga completa del navegador", async ({ page }) => {
    await page.goto("/");
    const date = await futureDate(page, 44);
    await bookDemo(page, {
      patientId: "valentina",
      professionalId: 1,
      date,
      hour: "11:30 a. m.",
      mode: "virtual"
    });

    const beforeReload = await readDb(page);
    const saved = beforeReload.appointments.find(
      (item) => item.patientId === "valentina" && item.status === "scheduled"
    );
    expect(saved).toBeTruthy();

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Está bien hacer una pausa");

    const afterReload = await readDb(page);
    expect(afterReload.appointments.find((item) => item.id === saved!.id)).toMatchObject({
      date,
      hour: "11:30 a. m.",
      status: "scheduled"
    });

    await openEspacio(page);
    await expect(page.locator(".appointment-item")).toContainText("Laura Méndez");
    await expect(page.locator(".appointment-item")).toContainText("11:30 a. m.");
  });

  test("el personaje y el rol elegidos se conservan tras recargar", async ({ page }) => {
    await page.goto("/");
    await openEspacio(page);
    await page.selectOption("#space-patient", "mateo");
    await expect(page.locator(".greeting-card")).toContainText("MATEO ARIAS");

    await openDemo(page);
    await page
      .getByRole("group", { name: "Elegir vista de demostración" })
      .getByRole("button", { name: /^Administrador/ })
      .click();
    await expect(page.getByText("VISTA DE ADMINISTRADOR")).toBeVisible();

    await page.reload();
    const db = await readDb(page);
    const settings = Object.fromEntries(db.settings.map(({ key, value }) => [key, value]));
    expect(settings.patientId).toBe("mateo");
    expect(settings.role).toBe("administrador");

    await openEspacio(page);
    await expect(page.locator("#space-patient")).toHaveValue("mateo");
    await expect(page.locator(".greeting-card")).toContainText("MATEO ARIAS");
  });

  test("cada personaje mantiene su propia cita activa", async ({ page }) => {
    await page.goto("/");
    const db = await readDb(page);
    const active = db.appointments.filter((item) => item.status === "scheduled");
    expect(active).toHaveLength(3);
    expect(new Set(active.map((item) => item.patientId)).size).toBe(3);

    await openEspacio(page);
    await page.selectOption("#space-patient", "camila");
    await expect(page.locator(".appointment-item")).toContainText("Julián Herrera");

    await page.selectOption("#space-patient", "valentina");
    await expect(page.locator(".appointment-item")).toContainText("Daniela Ríos");

    await page.selectOption("#space-patient", "mateo");
    await expect(page.locator(".appointment-item")).toContainText("Laura Méndez");
  });

  test("los datos locales no se comparten entre contextos aislados", async ({ browser }) => {
    const first = await browser.newContext();
    const firstPage = await first.newPage();
    await firstPage.goto("/");
    await bookDemo(firstPage, {
      patientId: "valentina",
      professionalId: 1,
      date: await futureDate(firstPage, 46),
      hour: "9:00 a. m.",
      mode: "virtual"
    });
    const firstDb = await readDb(firstPage);
    expect(
      firstDb.appointments.some((item) => item.patientId === "valentina" && item.source === "user")
    ).toBe(true);
    await first.close();

    const second = await browser.newContext();
    const secondPage = await second.newPage();
    await secondPage.goto("/");
    const secondDb = await readDb(secondPage);
    expect(
      secondDb.appointments.some((item) => item.patientId === "valentina" && item.source === "user")
    ).toBe(false);
    await second.close();
  });
});
