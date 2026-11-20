"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, BrainCircuit, Leaf, Wind } from "lucide-react";

const INTRO_KEY = "equilibramind:intro:v071";
const SHOW_MS = 1800;
const EXIT_MS = 420;

type Phase = "hidden" | "visible" | "leaving";

/**
 * Una bienvenida breve que no bloquea la navegación ni impide usar la página.
 * Se muestra una sola vez por pestaña y respeta prefers-reduced-motion.
 * El contenido principal sigue disponible aunque el navegador no ejecute JS.
 */
export function WelcomeIntro() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const timers = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("hidden");
  const shownInThisMount = useRef(false);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timers.current.push(id);
  }, []);

  const dismiss = useCallback(() => {
    if (phaseRef.current === "hidden") return;
    phaseRef.current = "leaving";
    setPhase("leaving");
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
    schedule(() => {
      phaseRef.current = "hidden";
      setPhase("hidden");
    }, EXIT_MS);
  }, [schedule]);

  // Al intentar navegar, la escena desaparece de inmediato, sin ocultar el menú.
  const hideImmediately = useCallback(() => {
    if (phaseRef.current === "hidden") return;
    phaseRef.current = "hidden";
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
    setPhase("hidden");
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(INTRO_KEY) === "seen";
      window.sessionStorage.setItem(INTRO_KEY, "seen");
    } catch {
      // La página también funciona cuando el almacenamiento de sesión está bloqueado.
    }
    // React StrictMode repite el efecto en desarrollo. Si esta misma
    // instancia ya inició la intro, debemos reprogramar su autocierre.
    if ((alreadySeen && !shownInThisMount.current) || motion.matches) return;
    shownInThisMount.current = true;

    phaseRef.current = "visible";
    setPhase("visible");
    schedule(dismiss, SHOW_MS);

    const onKeyboardInteraction = (event: KeyboardEvent) => {
      if (["Escape", "Tab", "Enter", " "].includes(event.key)) hideImmediately();
    };
    const onPointerInteraction = (event: PointerEvent) => {
      // El botón propio conserva su click; cualquier otra interacción
      // descarta inmediatamente el overlay antes de navegar.
      if (event.target instanceof Element && event.target.closest(".welcome-intro-skip")) return;
      hideImmediately();
    };
    const onReduceMotion = (event: MediaQueryListEvent) => {
      if (event.matches) hideImmediately();
    };

    window.addEventListener("keydown", onKeyboardInteraction);
    window.addEventListener("pointerdown", onPointerInteraction, true);
    motion.addEventListener("change", onReduceMotion);

    return () => {
      window.removeEventListener("keydown", onKeyboardInteraction);
      window.removeEventListener("pointerdown", onPointerInteraction, true);
      motion.removeEventListener("change", onReduceMotion);
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
    };
  }, [dismiss, hideImmediately, schedule]);

  if (phase === "hidden") return null;

  return (
    <section
      className={"welcome-intro" + (phase === "leaving" ? " welcome-intro-leaving" : "")}
      aria-label="Bienvenida visual a EquilibraMind"
      data-testid="welcome-intro"
    >
      <div className="welcome-intro-glow" aria-hidden="true" />
      <div className="welcome-intro-content">
        <div className="welcome-intro-mark" aria-hidden="true">
          <span className="welcome-intro-halo halo-one" />
          <span className="welcome-intro-halo halo-two" />
          <span className="welcome-intro-icon"><BrainCircuit size={45} strokeWidth={1.45}/></span>
          <Leaf className="welcome-intro-leaf" size={24} strokeWidth={1.6}/>
        </div>
        <span className="welcome-intro-eyebrow"><Wind size={15} aria-hidden="true"/> Un momento para ti</span>
        <p className="welcome-intro-title">
          <span>equilibra</span><strong>mind</strong><i>.</i>
        </p>
        <p className="welcome-intro-message">A veces, todo empieza con una pausa.</p>
        <p className="welcome-intro-disclaimer">Experiencia académica de bienestar · Simulación</p>
      </div>
      <button type="button" className="welcome-intro-skip" onClick={hideImmediately}>
        Entrar ahora <ArrowRight size={16} aria-hidden="true"/>
      </button>
    </section>
  );
}
