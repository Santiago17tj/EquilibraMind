/**
 * EquilibraMind: base de datos local de demostración (IndexedDB).
 *
 * No contiene identidades ni datos clínicos reales. Cada navegador guarda
 * su propia copia: NO hay servidor, sincronización ni autenticación.
 */
export type DemoRole = "paciente" | "psicologo" | "administrador";
export type VisitMode = "virtual" | "presencial";

export type DemoPatient = {
  id: string;
  name: string;
  label: string;
};
export type DemoProfessional = {
  id: number;
  name: string;
  role: string;
  focus: string;
  initials: string;
  color: string;
  experience: string;
  category: "laboral" | "estudiantil";
  audience: string;
  approaches: string[];
  bio: string;
  education: string;
};
export type DemoPlan = {
  id: string;
  name: string;
  price: number | null;
  billing: string;
};
export type DemoAppointment = {
  id: string;
  patientId: string;
  professionalId: number;
  name: string;
  role: string;
  date: string;
  hour: string;
  mode: VisitMode;
  price: number;
  status: "scheduled" | "cancelled";
  source: "seed" | "user";
};
export type DemoSnapshot = {
  patients: DemoPatient[];
  professionals: DemoProfessional[];
  plans: DemoPlan[];
  appointments: DemoAppointment[];
  settings: Record<string, string>;
};

export const demoPatients: DemoPatient[] = [
  { id: "valentina", name: "Valentina Cruz", label: "Valentina · Perfil paciente" },
  { id: "mateo", name: "Mateo Arias", label: "Mateo · Perfil paciente" },
  { id: "camila", name: "Camila Rojas", label: "Camila · Perfil paciente" }
];

export const specialists: DemoProfessional[] = [
  {
    id: 1, name: "Laura Méndez", role: "Psicología clínica",
    focus: "Estrés laboral y regulación emocional", initials: "LM", color: "peach",
    experience: "6 años · Trayectoria ficticia", category: "laboral",
    audience: "Personas adultas",
    approaches: ["Manejo del estrés", "Regulación emocional", "Autocuidado"],
    bio: "Perfil creado para ilustrar un acompañamiento centrado en la escucha, los hábitos saludables y la relación entre emociones y trabajo.",
    education: "Formación clínica simulada para fines educativos."
  },
  {
    id: 2, name: "Daniela Ríos", role: "Bienestar estudiantil",
    focus: "Ansiedad académica y hábitos de estudio", initials: "DR", color: "lilac",
    experience: "4 años · Trayectoria ficticia", category: "estudiantil",
    audience: "Estudiantes y jóvenes adultos",
    approaches: ["Estrés académico", "Organización del tiempo", "Hábitos de descanso"],
    bio: "Perfil ficticio enfocado en desafíos estudiantiles: equilibrar exámenes, proyectos, exigencias personales y tiempo de recuperación.",
    education: "Formación en bienestar estudiantil simulada."
  },
  {
    id: 3, name: "Julián Herrera", role: "Psicología organizacional",
    focus: "Prevención del burnout y equilibrio laboral", initials: "JH", color: "sage",
    experience: "8 años · Trayectoria ficticia", category: "laboral",
    audience: "Profesionales y equipos de trabajo",
    approaches: ["Prevención del agotamiento", "Límites saludables", "Bienestar laboral"],
    bio: "Perfil de demostración orientado a reconocer factores de sobrecarga y promover prácticas saludables en equipos y organizaciones.",
    education: "Formación organizacional simulada para la presentación."
  }
];

export const demoPlans: DemoPlan[] = [
  { id: "individual", name: "Sesión individual", price: 95000, billing: "por teleconsulta de ejemplo" },
  { id: "mensual", name: "Equilibrio mensual", price: 279000, billing: "mensual de ejemplo" },
  { id: "empresa", name: "Empresas", price: null, billing: "cotización simulada" }
];

const DB_NAME = "equilibramind-academica";
const DB_VERSION = 1;
const DB_STORES = ["patients", "professionals", "plans", "appointments", "settings"] as const;
const HOURS = ["9:00 a. m.", "11:30 a. m.", "3:00 p. m.", "5:00 p. m."];

function futureDay(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seedIntoTransaction(transaction: IDBTransaction) {
  for (const patient of demoPatients) transaction.objectStore("patients").put(patient);
  for (const professional of specialists) transaction.objectStore("professionals").put(professional);
  for (const plan of demoPlans) transaction.objectStore("plans").put(plan);

  const appointments: DemoAppointment[] = [
    {
      id: "sample-mateo", patientId: "mateo", professionalId: 1, name: "Laura Méndez",
      role: "Psicología clínica", date: futureDay(2), hour: "9:00 a. m.",
      mode: "virtual", price: 95000, status: "scheduled", source: "seed"
    },
    {
      id: "sample-camila", patientId: "camila", professionalId: 3, name: "Julián Herrera",
      role: "Psicología organizacional", date: futureDay(3), hour: "11:30 a. m.",
      mode: "virtual", price: 95000, status: "scheduled", source: "seed"
    },
    {
      id: "sample-valentina", patientId: "valentina", professionalId: 2, name: "Daniela Ríos",
      role: "Bienestar estudiantil", date: futureDay(4), hour: "3:00 p. m.",
      mode: "presencial", price: 120000, status: "scheduled", source: "seed"
    }
  ];
  for (const appointment of appointments) transaction.objectStore("appointments").put(appointment);
  transaction.objectStore("settings").put({ key: "patientId", value: "valentina" });
  transaction.objectStore("settings").put({ key: "role", value: "paciente" });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("No se pudo leer IndexedDB."));
  });
}
function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("No se pudo guardar la demostración."));
    transaction.onabort = () => reject(transaction.error ?? new Error("La escritura local fue cancelada."));
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new Error("Este navegador no permite guardar datos locales. Activa el almacenamiento del sitio.");
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of DB_STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: store === "settings" ? "key" : "id" });
        }
      }
      seedIntoTransaction(request.transaction!);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("No se pudo abrir la base de datos local."));
    request.onblocked = () => reject(new Error("Cierra otras pestañas de EquilibraMind e inténtalo de nuevo."));
  });
}

export async function loadDemoSnapshot(): Promise<DemoSnapshot> {
  const db = await openDatabase();
  try {
    const tx = db.transaction([...DB_STORES], "readonly");
    const [patients, professionals, plans, appointments, preferences] = await Promise.all([
      requestResult<DemoPatient[]>(tx.objectStore("patients").getAll()),
      requestResult<DemoProfessional[]>(tx.objectStore("professionals").getAll()),
      requestResult<DemoPlan[]>(tx.objectStore("plans").getAll()),
      requestResult<DemoAppointment[]>(tx.objectStore("appointments").getAll()),
      requestResult<{ key: string; value: string }[]>(tx.objectStore("settings").getAll())
    ]);
    const settings = Object.fromEntries(preferences.map(({ key, value }) => [key, value]));
    return { patients, professionals, plans, appointments, settings };
  } finally {
    db.close();
  }
}

export function findActiveBooking(snapshot: DemoSnapshot, patientId: string): DemoAppointment | null {
  return snapshot.appointments.find((item) => item.patientId === patientId && item.status === "scheduled") ?? null;
}

export async function setDemoSetting(key: "patientId" | "role" | `plan:${string}`, value: string): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction("settings", "readwrite");
    const completed = transactionComplete(tx);
    tx.objectStore("settings").put({ key, value });
    await completed;
  } finally {
    db.close();
  }
}

export type BookingInput = Pick<DemoAppointment, "professionalId" | "date" | "hour" | "mode">;
export async function saveDemoBooking(patientId: string, input: BookingInput): Promise<DemoAppointment> {
  const snapshot = await loadDemoSnapshot();
  const professional = snapshot.professionals.find((p) => p.id === input.professionalId);
  if (!snapshot.patients.some((p) => p.id === patientId) || !professional) {
    throw new Error("Selecciona un perfil ficticio válido.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.date < futureDay(0) || !HOURS.includes(input.hour)) {
    throw new Error("Selecciona una fecha y horario de demostración válidos.");
  }
  if (input.mode !== "virtual" && input.mode !== "presencial") {
    throw new Error("Selecciona la modalidad de demostración.");
  }
  const previous = findActiveBooking(snapshot, patientId);
  const occupied = snapshot.appointments.some((item) =>
    item.status === "scheduled" && item.id !== previous?.id &&
    item.professionalId === professional.id && item.date === input.date && item.hour === input.hour
  );
  if (occupied) throw new Error("Ese horario ya está ocupado en esta demostración. Prueba otro.");

  const appointment: DemoAppointment = {
    id: previous?.id ?? `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    patientId, professionalId: professional.id,
    name: professional.name, role: professional.role, date: input.date, hour: input.hour,
    mode: input.mode, price: input.mode === "virtual" ? 95000 : 120000,
    status: "scheduled", source: "user"
  };
  const db = await openDatabase();
  try {
    const tx = db.transaction("appointments", "readwrite");
    const completed = transactionComplete(tx);
    tx.objectStore("appointments").put(appointment);
    await completed;
  } finally {
    db.close();
  }
  return appointment;
}

export async function cancelDemoBooking(patientId: string, id: string): Promise<void> {
  const snapshot = await loadDemoSnapshot();
  const appointment = snapshot.appointments.find((item) =>
    item.id === id && item.patientId === patientId && item.status === "scheduled"
  );
  if (!appointment) throw new Error("No se encontró esa reserva ficticia.");
  const db = await openDatabase();
  try {
    const tx = db.transaction("appointments", "readwrite");
    const completed = transactionComplete(tx);
    tx.objectStore("appointments").put({ ...appointment, status: "cancelled" });
    await completed;
  } finally {
    db.close();
  }
}

export async function resetDemoDatabase(): Promise<DemoSnapshot> {
  const db = await openDatabase();
  try {
    const tx = db.transaction([...DB_STORES], "readwrite");
    const completed = transactionComplete(tx);
    for (const store of DB_STORES) tx.objectStore(store).clear();
    seedIntoTransaction(tx);
    await completed;
  } finally {
    db.close();
  }
  return loadDemoSnapshot();
}
