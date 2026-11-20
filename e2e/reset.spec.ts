import { test, expect } from "@playwright/test";
import {
  acceptNextDialog,
  bookDemo,
  dismissNextDialog,
  futureDate,
  openDemo,
  openEspacio,
  readDb,
  switchRole
} from "./helpers";

test.describe("Restablecimiento de la demostración", () => {
  test("restablece personajes, citas, planes y preferencias", async ({ page }) => {
    await page.goto("/");
    await bookDemo(page, {
      patientId: "valentina",
      professionalId: 1,
      date: await futureDate(page, 49),
      hour: "9:00 a. m.",
      mode: "virtual"
    });
    await openEspacio(page);
    await page.selectOption("#space-patient", "mateo");

    await openDemo(page);
    acceptNextDialog(page);
    await page.getByRole("button", { name: /Restablecer datos de la demo/ }).click();

    await expect(page.getByText("VISTA DE PACIENTE")).toBeVisible();
    const db = await readDb(page);
    const settings = Object.fromEntries(db.settings.map(({ key, value }) => [key, value]));
    expect(settings.patientId).toBe("valentina");
    expect(settings.role).toBe("paciente");
    expect(db.appointments.filter((item) => item.status === "scheduled")).toHaveLength(3);
    expect(db.appointments.filter((item) => item.status === "cancelled")).toHaveLength(0);
    expect(db.appointments.some((item) => item.source === "user")).toBe(false);

    await switchRole(page, "Administrador");
    await expect(page.locator(".role-stat").filter({ hasText: "Reservas activas" })).toContainText("3");
    await expect(page.locator(".role-stat").filter({ hasText: "Valor de reservas" })).toContainText(
      "285.000"
    );
  });

  test("cancelar el diálogo no modifica los datos", async ({ page }) => {
    await page.goto("/");
    await openEspacio(page);
    acceptNextDialog(page);
    await page.getByRole("button", { name: "Cancelar reserva demo" }).click();
    await expect(page.locator(".cancel-notice")).toBeVisible();

    await openDemo(page);
    const before = await readDb(page);
    dismissNextDialog(page);
    await page.getByRole("button", { name: /Restablecer datos de la demo/ }).click();

    const after = await readDb(page);
    expect(after.appointments.filter((item) => item.status === "scheduled")).toHaveLength(
      before.appointments.filter((item) => item.status === "scheduled").length
    );
    expect(after.appointments.filter((item) => item.status === "cancelled")).toHaveLength(1);
  });
});
