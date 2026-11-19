import { test, expect } from "@playwright/test";
import {
  acceptNextDialog,
  bookDemo,
  futureDate,
  openDemo,
  openEspacio,
  readDb,
  switchRole
} from "./helpers";

test.describe("Coherencia entre paciente, psicólogo y administrador", () => {
  test("una reserva creada se refleja en las tres vistas", async ({ page }) => {
    await page.goto("/");
    const date = await futureDate(page, 47);
    await bookDemo(page, {
      patientId: "valentina",
      professionalId: 1,
      date,
      hour: "11:30 a. m.",
      mode: "virtual"
    });

    await openDemo(page);
    await switchRole(page, "Paciente");
    await expect(page.getByText("VISTA DE PACIENTE")).toBeVisible();
    await expect(page.locator(".role-stat").filter({ hasText: "Mis reservas" })).toContainText("1 activa");
    await expect(page.locator(".role-panel").filter({ hasText: "Próxima cita ficticia" })).toContainText(
      "Laura Méndez"
    );

    await switchRole(page, "Psicólogo");
    await expect(page.getByText("VISTA DE PSICÓLOGO")).toBeVisible();
    await page.selectOption("#demo-professional", "1");
    const agenda = page.locator(".role-appointment-list");
    await expect(agenda).toContainText("Valentina Cruz");
    await expect(agenda).toContainText("Mateo Arias");
    await expect(page.locator(".role-stat").filter({ hasText: "Reservas activas" })).toContainText("2");

    await switchRole(page, "Administrador");
    await expect(page.getByText("VISTA DE ADMINISTRADOR")).toBeVisible();
    await expect(page.locator(".role-stat").filter({ hasText: "Pacientes ficticios" })).toContainText("3");
    await expect(page.locator(".role-stat").filter({ hasText: "Reservas activas" })).toContainText("3");
    await expect(page.locator(".role-stat").filter({ hasText: "Valor de reservas" })).toContainText(
      "285.000"
    );
  });

  test("cancelar actualiza los conteos y retira la cita de la agenda profesional", async ({ page }) => {
    await page.goto("/");
    await bookDemo(page, {
      patientId: "valentina",
      professionalId: 1,
      date: await futureDate(page, 48),
      hour: "3:00 p. m.",
      mode: "virtual"
    });

    await openEspacio(page);
    acceptNextDialog(page);
    await page.getByRole("button", { name: "Cancelar reserva demo" }).click();
    await expect(page.locator(".cancel-notice")).toBeVisible();

    await openDemo(page);
    await switchRole(page, "Psicólogo");
    await page.selectOption("#demo-professional", "1");
    const agenda = page.locator(".role-appointment-list");
    await expect(agenda).not.toContainText("Valentina Cruz");
    await expect(agenda).toContainText("Mateo Arias");

    await switchRole(page, "Administrador");
    await expect(page.locator(".role-stat").filter({ hasText: "Reservas activas" })).toContainText("2");
    await expect(page.locator(".role-stat").filter({ hasText: "Reservas activas" })).toContainText(
      "1 canceladas de prueba"
    );
    await expect(page.locator(".role-stat").filter({ hasText: "Valor de reservas" })).toContainText(
      "190.000"
    );
  });

  test("el selector de personaje del panel cambia la reserva mostrada", async ({ page }) => {
    await page.goto("/");
    await openDemo(page);
    await switchRole(page, "Paciente");

    await page.selectOption("#demo-patient", "mateo");
    await expect(page.locator(".role-panel").filter({ hasText: "Próxima cita ficticia" })).toContainText(
      "Laura Méndez"
    );
    await expect(page.locator(".greeting-card")).toHaveCount(0);

    await page.selectOption("#demo-patient", "camila");
    await expect(page.locator(".role-panel").filter({ hasText: "Próxima cita ficticia" })).toContainText(
      "Julián Herrera"
    );

    const db = await readDb(page);
    expect(db.settings.find((item) => item.key === "patientId")?.value).toBe("camila");
  });

  test("la agenda del psicólogo cambia al elegir otro profesional", async ({ page }) => {
    await page.goto("/");
    await openDemo(page);
    await switchRole(page, "Psicólogo");

    await page.selectOption("#demo-professional", "1");
    await expect(page.locator(".role-appointment-list")).toContainText("Mateo Arias");

    await page.selectOption("#demo-professional", "2");
    await expect(page.locator(".role-appointment-list")).toContainText("Valentina Cruz");

    await page.selectOption("#demo-professional", "3");
    await expect(page.locator(".role-appointment-list")).toContainText("Camila Rojas");
  });
});
