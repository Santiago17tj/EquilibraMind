import { test, expect } from "@playwright/test";
import {
  acceptNextDialog,
  bookDemo,
  futureDate,
  openEspacio,
  openSection,
  readDb
} from "./helpers";

test.describe("Reservas ficticias", () => {
  test("marca los horarios ocupados y libera los disponibles", async ({ page }) => {
    await page.goto("/");
    const db = await readDb(page);
    const mateoSeed = db.appointments.find(
      (item) => item.patientId === "mateo" && item.status === "scheduled"
    );
    expect(mateoSeed, "debe existir la cita semilla de Mateo").toBeTruthy();

    await openSection(page, "Profesionales");
    await page.selectOption("#booking-patient", "valentina");
    await page.selectOption("#professional", String(mateoSeed!.professionalId));
    await page.fill("#date", mateoSeed!.date);

    const occupied = page.locator(`#hour option[value="${mateoSeed!.hour}"]`);
    await expect(occupied).toContainText("Ocupado en la demo");
    expect(await occupied.isDisabled()).toBe(true);

    const freeDate = await futureDate(page, 45);
    await page.fill("#date", freeDate);
    const released = page.locator(`#hour option[value="${mateoSeed!.hour}"]`);
    await expect(released).not.toContainText("Ocupado en la demo");
    expect(await released.isDisabled()).toBe(false);
  });

  test("cambiar fecha o profesional limpia la hora elegida", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");

    await page.fill("#date", await futureDate(page, 30));
    await page.selectOption("#hour", "11:30 a. m.");
    await expect(page.locator("#hour")).toHaveValue("11:30 a. m.");

    await page.fill("#date", await futureDate(page, 31));
    await expect(page.locator("#hour")).toHaveValue("");

    await page.selectOption("#hour", "3:00 p. m.");
    await page.selectOption("#professional", "3");
    await expect(page.locator("#hour")).toHaveValue("");
  });

  test("la cita propia no bloquea su horario al reprogramar", async ({ page }) => {
    await page.goto("/");
    const db = await readDb(page);
    const own = db.appointments.find(
      (item) => item.patientId === "valentina" && item.status === "scheduled"
    );
    expect(own, "Valentina debe tener una cita semilla").toBeTruthy();

    await openSection(page, "Profesionales");
    await page.selectOption("#booking-patient", "valentina");
    await page.selectOption("#professional", String(own!.professionalId));
    await page.fill("#date", own!.date);

    const ownSlot = page.locator(`#hour option[value="${own!.hour}"]`);
    await expect(ownSlot).not.toContainText("Ocupado en la demo");
    expect(await ownSlot.isDisabled()).toBe(false);
  });

  test("crea una reserva virtual, la guarda en IndexedDB y la muestra en Mi espacio", async ({ page }) => {
    await page.goto("/");
    const date = await futureDate(page, 40);

    await bookDemo(page, {
      patientId: "valentina",
      professionalId: 1,
      date,
      hour: "11:30 a. m.",
      mode: "virtual"
    });

    await expect(page.locator(".success-message")).toContainText("Reserva de demostración guardada");
    await expect(page.locator(".booking-summary")).toContainText("Laura Méndez");
    await expect(page.locator(".booking-summary")).toContainText("$ 95.000");

    const db = await readDb(page);
    const active = db.appointments.filter(
      (item) => item.patientId === "valentina" && item.status === "scheduled"
    );
    expect(active).toHaveLength(1);
    expect(active[0]).toMatchObject({
      professionalId: 1,
      name: "Laura Méndez",
      date,
      hour: "11:30 a. m.",
      mode: "virtual",
      price: 95000,
      source: "user"
    });

    await page.getByRole("button", { name: /Ver en Mi espacio/ }).click();
    const appointment = page.locator(".appointment-item");
    await expect(appointment).toContainText("Laura Méndez");
    await expect(appointment).toContainText("11:30 a. m.");
    await expect(appointment).toContainText("Teleconsulta");
    await expect(appointment).toContainText("$ 95.000");
  });

  test("la modalidad es exclusivamente teleconsulta, con precio único", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");
    await expect(page.locator(".teleconsultation-only")).toContainText("Teleconsulta");
    await expect(page.locator(".teleconsultation-only")).toContainText("Modalidad única");
    await expect(page.locator('input[name="appointment-mode"]')).toHaveCount(0);

    const seeded = await readDb(page);
    expect(seeded.appointments.every((item) => item.mode === "virtual" && item.price === 95000)).toBe(true);
    const date = await futureDate(page, 41);
    await bookDemo(page, {
      patientId: "mateo",
      professionalId: 3,
      date,
      hour: "5:00 p. m.",
      mode: "virtual"
    });

    await expect(page.locator(".booking-summary")).toContainText("$ 95.000");
    const db = await readDb(page);
    const active = db.appointments.find(
      (item) => item.patientId === "mateo" && item.status === "scheduled"
    );
    expect(active).toMatchObject({
      professionalId: 3,
      mode: "virtual",
      price: 95000,
      date,
      hour: "5:00 p. m."
    });
  });

  test("modifica la cita conservando el registro y actualizando la hora", async ({ page }) => {
    await page.goto("/");
    const date = await futureDate(page, 42);
    await bookDemo(page, {
      patientId: "valentina",
      professionalId: 2,
      date,
      hour: "9:00 a. m.",
      mode: "virtual"
    });

    const before = await readDb(page);
    const original = before.appointments.find(
      (item) => item.patientId === "valentina" && item.status === "scheduled"
    );
    expect(original).toBeTruthy();

    await openEspacio(page);
    await page.getByRole("button", { name: /Cambiar cita demo/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cada historia");
    await expect(page.locator("#professional")).toHaveValue("2");
    await expect(page.locator("#date")).toHaveValue(date);
    await expect(page.locator("#hour")).toHaveValue("9:00 a. m.");

    await page.selectOption("#hour", "5:00 p. m.");
    await page.getByRole("button", { name: /Confirmar reserva ficticia/ }).click();
    await expect(page.locator(".success-message")).toBeVisible();

    const after = await readDb(page);
    const updated = after.appointments.find((item) => item.id === original!.id);
    expect(updated).toBeTruthy();
    expect(updated).toMatchObject({ date, hour: "5:00 p. m.", status: "scheduled" });
    expect(
      after.appointments.filter((item) => item.patientId === "valentina" && item.status === "scheduled")
    ).toHaveLength(1);

    await openEspacio(page);
    await expect(page.locator(".appointment-item")).toContainText("5:00 p. m.");
  });

  test("cancela la cita, la marca como cancelada y libera al personaje", async ({ page }) => {
    await page.goto("/");
    await bookDemo(page, {
      patientId: "valentina",
      professionalId: 1,
      date: await futureDate(page, 43),
      hour: "3:00 p. m.",
      mode: "virtual"
    });

    await openEspacio(page);
    acceptNextDialog(page);
    await page.getByRole("button", { name: "Cancelar reserva demo" }).click();

    await expect(page.locator(".cancel-notice")).toContainText("La reserva ficticia fue cancelada");
    await expect(page.locator(".appointment-item")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Explorar profesionales/ })).toBeVisible();

    const db = await readDb(page);
    expect(
      db.appointments.filter((item) => item.patientId === "valentina" && item.status === "scheduled")
    ).toHaveLength(0);
    expect(db.appointments.some((item) => item.patientId === "valentina" && item.status === "cancelled")).toBe(
      true
    );
  });

  test("cambiar de personaje limpia la fecha y la hora elegidas", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");
    await page.fill("#date", await futureDate(page, 50));
    await page.selectOption("#hour", "9:00 a. m.");
    await expect(page.locator("#hour")).toHaveValue("9:00 a. m.");

    await page.selectOption("#booking-patient", "mateo");
    await expect(page.locator("#date")).toHaveValue("");
    await expect(page.locator("#hour")).toHaveValue("");
    await expect(page.locator("#hour")).toBeDisabled();
  });

  test("no permite confirmar sin fecha y hora válidas", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");
    const confirm = page.getByRole("button", { name: /Confirmar reserva ficticia/ });
    await expect(confirm).toBeDisabled();

    await page.fill("#date", await futureDate(page, 20));
    await expect(confirm).toBeDisabled();

    await page.selectOption("#hour", "9:00 a. m.");
    await expect(confirm).toBeEnabled();
  });
});
