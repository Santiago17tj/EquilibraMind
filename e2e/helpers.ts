import { expect, type Page } from "@playwright/test";

export type DbPatient = { id: string; name: string; label: string };
export type DbProfessional = {
  id: number;
  name: string;
  role: string;
  category: "laboral" | "estudiantil";
};
export type DbAppointment = {
  id: string;
  patientId: string;
  professionalId: number;
  name: string;
  role: string;
  date: string;
  hour: string;
  mode: "virtual" | "presencial";
  price: number;
  status: "scheduled" | "cancelled";
  source: "seed" | "user";
};
export type DbSnapshot = {
  patients: DbPatient[];
  professionals: DbProfessional[];
  plans: { id: string; name: string; price: number | null }[];
  appointments: DbAppointment[];
  settings: { key: string; value: string }[];
};

/** Lee directamente IndexedDB para comprobar la persistencia real. */
export async function readDb(page: Page): Promise<DbSnapshot> {
  return page.evaluate(async (databaseName) => {
    const stores = ["patients", "professionals", "plans", "appointments", "settings"] as const;
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const openExisting = () =>
      new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(databaseName);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

    // No crear la base desde la prueba: se espera a que la app la inicialice.
    let db: IDBDatabase | null = null;
    for (let attempt = 0; attempt < 200 && !db; attempt += 1) {
      const databases = await indexedDB.databases();
      if (databases.some((entry) => entry.name === databaseName)) {
        const candidate = await openExisting();
        if (stores.every((store) => candidate.objectStoreNames.contains(store))) {
          db = candidate;
        } else {
          candidate.close();
        }
      }
      if (!db) await sleep(50);
    }
    if (!db) throw new Error("IndexedDB de la demo no está inicializada.");

    const tx = db.transaction([...stores], "readonly");
    const read = <T,>(store: string) =>
      new Promise<T>((resolve, reject) => {
        const request = tx.objectStore(store).getAll();
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      });
    const [patients, professionals, plans, appointments, settings] = await Promise.all([
      read<DbSnapshot["patients"]>("patients"),
      read<DbSnapshot["professionals"]>("professionals"),
      read<DbSnapshot["plans"]>("plans"),
      read<DbSnapshot["appointments"]>("appointments"),
      read<DbSnapshot["settings"]>("settings")
    ]);
    db.close();
    return { patients, professionals, plans, appointments, settings };
  }, "equilibramind-academica");
}

/** Fecha local (zona del navegador) desplazada N días, en formato ISO. */
export async function futureDate(page: Page, days: number): Promise<string> {
  return page.evaluate((offset) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }, days);
}

/** Abre el menú móvil solo cuando el botón hamburguesa está visible. */
export async function openMobileMenuIfNeeded(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: "Abrir menú" });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
  }
}

export type SectionLabel =
  | "Inicio"
  | "Mi bienestar"
  | "Profesionales"
  | "Para empresas"
  | "Planes";

/** Navega por la cabecera, abriendo antes el menú en móvil. */
export async function openSection(page: Page, label: SectionLabel): Promise<void> {
  await openMobileMenuIfNeeded(page);
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("button", { name: label, exact: true })
    .click();
  await expect(page.locator("main#contenido")).toBeVisible();
}

/** Acceso desde el pie de página a Mi espacio. */
export async function openEspacio(page: Page): Promise<void> {
  await page.locator("footer").getByRole("button", { name: "Mi espacio de prueba" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bienvenida");
}

/** Acceso desde el pie de página a Probar roles. */
export async function openDemo(page: Page): Promise<void> {
  await page.locator("footer").getByRole("button", { name: "Paneles por rol" }).click();
  await expect(page.getByRole("heading", { name: /Una plataforma,/ })).toBeVisible();
}

export async function switchRole(
  page: Page,
  role: "Paciente" | "Psicólogo" | "Administrador"
): Promise<void> {
  await page
    .getByRole("group", { name: "Elegir vista de demostración" })
    .getByRole("button", { name: new RegExp(`^${role}`) })
    .click();
}

export type BookingOptions = {
  patientId?: string;
  professionalId?: number | string;
  date: string;
  hour: string;
  mode?: "virtual" | "presencial";
};

/** Completa el formulario de reserva ficticia y confirma. */
export async function bookDemo(page: Page, options: BookingOptions): Promise<void> {
  await openSection(page, "Profesionales");
  if (options.patientId) await page.selectOption("#booking-patient", options.patientId);
  if (options.professionalId !== undefined) {
    await page.selectOption("#professional", String(options.professionalId));
  }
  if (options.mode) {
    await page.locator(`input[name="appointment-mode"][value="${options.mode}"]`).check();
  }
  await page.fill("#date", options.date);
  await page.selectOption("#hour", options.hour);
  await page.getByRole("button", { name: /Confirmar reserva ficticia/ }).click();
  await expect(page.locator(".success-message")).toBeVisible();
}

/** Acepta el próximo window.confirm de la página. */
export function acceptNextDialog(page: Page): void {
  page.once("dialog", (dialog) => dialog.accept());
}

/** Descarta el próximo window.confirm de la página. */
export function dismissNextDialog(page: Page): void {
  page.once("dialog", (dialog) => dialog.dismiss());
}

/** Nombres accesibles de todos los controles visibles (para auditoría). */
export async function visibleControlNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const controls = Array.from(
      document.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea")
    );
    return controls
      .filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      })
      .map((element) => {
        if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
          const labels = Array.from(element.labels ?? []).map((label) => label.textContent?.trim() ?? "");
          return element.getAttribute("aria-label") ?? labels.join(" ") ?? "";
        }
        return (
          element.getAttribute("aria-label") ??
          element.textContent?.replace(/\s+/g, " ").trim() ??
          ""
        );
      });
  });
}
