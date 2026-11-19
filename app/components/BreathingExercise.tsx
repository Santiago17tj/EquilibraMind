"use client";

import { useEffect, useState } from "react";
import { Heart, Pause, Play, RotateCcw, Wind } from "lucide-react";

export function BreathingExercise({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const duration = 60;
  const complete = elapsed >= duration;
  const phase = complete ? "Bien hecho" : elapsed % 10 < 4 ? "Inhala" : "Exhala";
  const countdown = complete ? 0 : elapsed % 10 < 4 ? 4 - elapsed % 10 : 10 - elapsed % 10;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setElapsed(current => Math.min(current + 1, duration));
    }, 1000);
    return () => window.clearInterval(id);
  }, [active]);
  useEffect(() => {
    if (elapsed >= duration && active) setActive(false);
  }, [elapsed, active]);

  return <section className={"breathing-widget " + (compact ? "breathing-compact" : "")} aria-label="Ejercicio guiado de respiración de 1 minuto">
    <div className="breathing-intro">
      <span className="breathing-eyebrow"><Wind size={16}/> UNA PAUSA PARA TI</span>
      <h3>Un minuto de calma.</h3>
      <p>Regálate un momento para respirar sin prisa. Sigue el ritmo solo si te resulta cómodo.</p>
    </div>
    <div className={"breath-orbit " + (active ? "is-active" : "")} role="img" aria-label="Círculo que crece al inhalar y disminuye al exhalar">
      <div className="breath-ring breath-ring-one" />
      <div className="breath-ring breath-ring-two" />
      <div className="breath-core">
        <Heart size={24} strokeWidth={1.6} />
        <strong>{!active && !complete && elapsed === 0 ? "Respira" : phase}</strong>
        <span>{complete ? "1 minuto" : active ? countdown + " segundos" : elapsed > 0 ? "En pausa" : "A tu ritmo"}</span>
      </div>
    </div>
    <div className="breathing-controls">
      <div className="breathing-timeline" role="progressbar" aria-valuenow={elapsed} aria-valuemin={0} aria-valuemax={duration} aria-label="Progreso del ejercicio"><span style={{ width: elapsed / duration * 100 + "%" }}/></div>
      <div className="breathing-time"><span>{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</span><span>01:00</span></div>
      <div className="breathing-buttons">
        <button type="button" className="button button-primary" onClick={() => {
          if (complete) { setElapsed(0); setActive(true); }
          else setActive(!active);
        }}>{complete ? <><RotateCcw size={16}/> Repetir ejercicio</> : active ? <><Pause size={16}/> Pausar</> : <><Play size={16}/> {elapsed ? "Continuar" : "Comenzar"}</>}</button>
        {elapsed > 0 && !complete && <button type="button" className="breathing-reset" onClick={() => {setActive(false); setElapsed(0);}} aria-label="Reiniciar ejercicio"><RotateCcw size={18}/></button>}
      </div>
    </div>
    <p className="breathing-disclaimer">Práctica general de relajación, no tratamiento médico. Si te resulta incómoda, detente y respira normalmente.</p>
  </section>;
}
