import { expect, test } from "@playwright/test";
import { openSection, readDb } from "./helpers";

test.describe("Modelo exclusivo de teleconsulta", () => {
  test("no ofrece consulta presencial en directorio, planes ni paneles", async ({ page }) => {
    await page.goto("/");
    await openSection(page, "Profesionales");

    await expect(page.locator(".teleconsultation-only")).toContainText("Teleconsulta");
    await expect(page.locator('input[name="appointment-mode"]')).toHaveCount(0);
    await expect(page.getByText(/Presencial futura|Presencial proyectada|Presencial en Bucaramanga/i)).toHaveCount(0);

    await openSection(page, "Planes");
    await expect(page.getByText(/Presencial proyectada|\$120\.000/)).toHaveCount(0);

    await page.locator("footer").getByRole("button", { name: "Paneles por rol" }).click();
    await page.getByRole("group", { name: "Elegir vista de demostración" })
      .getByRole("button", { name: /^Administrador/ }).click();
    await expect(page.getByText("Modelo de teleconsulta")).toBeVisible();
    await expect(page.getByText("Teleconsulta simulada")).toHaveCount(0);
    await expect(page.getByText("Presencial proyectada")).toHaveCount(0);
  });

  test("convierte las reservas locales previas sin borrar datos del usuario", async ({ page }) => {
    await page.goto("/");
    // La primera visita deja crear el contexto de origen. Se reemplaza su DB
    // aislada por una copia v1 para probar la actualización real a v2.
    await readDb(page);
    await page.evaluate(async () => {
      const name = "equilibramind-academica";
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error("Base bloqueada al construir fixture v1"));
      });
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(name, 1);
        req.onupgradeneeded = () => {
          for (const store of ["patients", "professionals", "plans", "appointments", "settings"]) {
            req.result.createObjectStore(store, { keyPath: store === "settings" ? "key" : "id" });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(["patients", "professionals", "plans", "appointments", "settings"], "readwrite");
        tx.objectStore("patients").put({ id: "valentina", name: "Valentina Cruz", label: "Valentina · Perfil paciente" });
        tx.objectStore("professionals").put({ id: 2, name: "Daniela Ríos", role: "Bienestar estudiantil" });
        tx.objectStore("plans").put({ id: "individual", name: "Sesión individual", price: 95000, billing: "ejemplo" });
        tx.objectStore("settings").put({ key: "patientId", value: "valentina" });
        tx.objectStore("appointments").put({
          id: "legacy-presencial", patientId: "valentina", professionalId: 2,
          name: "Daniela Ríos", role: "Bienestar estudiantil",
          date: "2099-12-31", hour: "3:00 p. m.", mode: "presencial",
          price: 120000, status: "scheduled", source: "user"
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
    });

    await page.reload();
    await page.waitForFunction(async () =>
      (await indexedDB.databases()).some((entry) => entry.name === "equilibramind-academica" && entry.version === 2)
    );
    const data = await readDb(page);
    expect(data.appointments).toHaveLength(1);
    expect(data.appointments[0]).toMatchObject({
      id: "legacy-presencial", patientId: "valentina", professionalId: 2,
      date: "2099-12-31", hour: "3:00 p. m.", status: "scheduled", source: "user",
      mode: "virtual", price: 95000
    });
    expect(data.settings.find((setting) => setting.key === "patientId")?.value).toBe("valentina");
  });
});
