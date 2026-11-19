"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Image as ImageIcon, AlertCircle, LoaderCircle, ShieldCheck } from "lucide-react";
import { loadDemoSnapshot } from "../lib/demo-db";

type DiagnosticResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const portraits = [
  { name: "Laura", path: "/images/laura-v06.avif" },
  { name: "Daniela", path: "/images/daniela-v06.avif" },
  { name: "Julián", path: "/images/julian.avif" }
];

type ImageTest = { ok: boolean; pixels: number; rgb: number[] | null };
function imageReady(path: string): Promise<ImageTest> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 20;
        canvas.height = 20;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve({ ok: false, pixels: img.naturalWidth, rgb: null });
        ctx.drawImage(img, 0, 0, 20, 20);
        const pixels = ctx.getImageData(0, 0, 20, 20).data;
        const rgb: number[] = [];
        for (let i = 0; i < pixels.length; i += 4) rgb.push(pixels[i], pixels[i + 1], pixels[i + 2]);
        resolve({ ok: img.naturalWidth >= 800 && img.naturalHeight >= 800, pixels: img.naturalWidth, rgb });
      } catch {
        resolve({ ok: false, pixels: img.naturalWidth, rgb: null });
      }
    };
    img.onerror = () => resolve({ ok: false, pixels: 0, rgb: null });
    img.src = path;
  });
}
function averagePixelDifference(a: ImageTest, b: ImageTest): number {
  if (!a.rgb || !b.rgb || a.rgb.length !== b.rgb.length) return 0;
  return a.rgb.reduce((sum, value, i) => sum + Math.abs(value - b.rgb![i]), 0) / a.rgb.length;
}

export function DemoDiagnostics() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setResults([]);
    const checks: DiagnosticResult[] = [];
    try {
      const data = await loadDemoSnapshot();
      checks.push({
        name: "Base local IndexedDB",
        ok: data.patients.length >= 3 && data.professionals.length >= 3 && data.plans.length >= 3,
        detail: `${data.patients.length} pacientes ficticios · ${data.professionals.length} profesionales · ${data.plans.length} planes`
      });
      const referencesOk = data.appointments.every((item) =>
        data.patients.some((patient) => patient.id === item.patientId)
        && data.professionals.some((professional) => professional.id === item.professionalId)
      );
      checks.push({
        name: "Consistencia de reservas",
        ok: referencesOk,
        detail: `${data.appointments.length} registros de cita · ${data.appointments.filter(item => item.status === "scheduled").length} activos`
      });
    } catch (error) {
      checks.push({
        name: "Base local IndexedDB",
        ok: false,
        detail: error instanceof Error ? error.message : "Error al leer el almacenamiento del navegador"
      });
    }

    const seenPaths = new Set(portraits.map((item) => item.path));
    const images = await Promise.all(portraits.map(async (portrait) => ({
      ...portrait, result: await imageReady(portrait.path)
    })));
    const imagesLoaded = images.every((item) => item.result.ok);
    checks.push({
      name: "Resolución de retratos",
      ok: imagesLoaded,
      detail: images.map((item) => item.name + ": " + (item.result.ok ? item.result.pixels + " px" : "no cargó")).join(" · ")
    });
    const distances = [
      averagePixelDifference(images[0].result, images[1].result),
      averagePixelDifference(images[0].result, images[2].result),
      averagePixelDifference(images[1].result, images[2].result)
    ];
    checks.push({
      name: "Contenido visual distinto",
      ok: imagesLoaded && seenPaths.size === portraits.length && distances.every((value) => value > 18),
      detail: imagesLoaded ? "Las miniaturas tienen contenido visual diferente." : "Primero deben cargarse correctamente los tres retratos."
    });
    setResults(checks);
    setLastChecked(new Intl.DateTimeFormat("es-CO", { hour:"2-digit",minute:"2-digit" }).format(new Date()));
    setRunning(false);
  };

  const passed = results.filter(item => item.ok).length;
  return <section className="demo-healthcheck" aria-label="Diagnóstico local de la demostración">
    <div className="demo-healthcheck-intro">
      <span className="eyebrow"><ShieldCheck size={16}/> CONTROL DE CALIDAD · v0.6</span>
      <h3>Comprueba esta demostración.</h3>
      <p>Antes de exponer, revisa que tu navegador tenga los personajes, las citas y las fotografías de alta resolución. Esta comprobación es de solo lectura.</p>
      <button type="button" className="button button-outline" onClick={run} disabled={running}>
        {running ? <><LoaderCircle size={16}/> Comprobando…</> : <><ClipboardCheck size={16}/> Verificar demo en este navegador</>}
      </button>
    </div>
    {results.length > 0 && <div className="demo-healthcheck-results" aria-live="polite">
      <strong>{passed} de {results.length} comprobaciones correctas {passed === results.length ? "✓" : "— revisar"}</strong>
      <span>Comprobado a las {lastChecked}</span>
      <div className="demo-healthcheck-list">
        {results.map(item => <div className={"demo-healthcheck-item " + (item.ok ? "ok" : "failed")} key={item.name}>
          {item.ok ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
          <div><b>{item.name}</b><small>{item.detail}</small></div>
        </div>)}
      </div>
      <small><ImageIcon size={14}/> La prueba compara carga, resolución y píxeles, pero no certifica identidad, accesibilidad ni consultas reales.</small>
    </div>}
  </section>;
}
