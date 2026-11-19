"use client";

import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Heart, X } from "lucide-react";

export type GuideAudience = "personas" | "empresas";
export type GuideSection = "inicio" | "chequeo" | "profesionales" | "empresas" | "planes" | "espacio" | "demo";

export type GuideStep = {
  section: GuideSection;
  title: string;
  description: string;
  hint: string;
  focus?: "booking" | "metrics";
};

export const demoFlows: Record<GuideAudience, GuideStep[]> = {
  personas: [
    {
      section: "inicio", title: "Bienvenido a EquilibraMind",
      description: "Conoce una propuesta que acompaña el bienestar cotidiano y reconoce la sobrecarga laboral y estudiantil.",
      hint: "Explica para quién está pensada la plataforma."
    },
    {
      section: "chequeo", title: "Reconocer cómo nos sentimos",
      description: "Prueba seis preguntas de reflexión. No son una evaluación clínica ni sirven para diagnosticar burnout.",
      hint: "Responde el chequeo y muestra cómo termina en una orientación responsable."
    },
    {
      section: "profesionales", title: "Conocer opciones de acompañamiento",
      description: "Explora fichas y enfoques de tres profesionales completamente ficticios.",
      hint: "Abre una ficha y explica que las fotografías se generaron con IA."
    },
    {
      section: "profesionales", focus: "booking", title: "Simular una reserva",
      description: "Selecciona teleconsulta o presencial futura, fecha, horario y observa el precio antes de confirmar.",
      hint: "Puedes confirmar una cita de ejemplo; no se presta atención real."
    },
    {
      section: "espacio", title: "Mi espacio personal",
      description: "La cita ficticia se guarda en el dispositivo. Es posible modificarla o cancelarla.",
      hint: "Muestra la reserva y el ejercicio interactivo de respiración."
    },
    {
      section: "demo", title: "Tres perspectivas conectadas",
      description: "El paciente, el profesional y el administrador consultan los mismos registros ficticios de este navegador.",
      hint: "Prueba el selector de roles. No hay cuentas ni permisos reales."
    }
  ],
  empresas: [
    {
      section: "inicio", title: "El reto del bienestar organizacional",
      description: "Presenta la oportunidad de prevenir la sobrecarga y fomentar entornos laborales más saludables.",
      hint: "Explica el problema y el público corporativo."
    },
    {
      section: "empresas", title: "La propuesta para empresas",
      description: "Explora los programas y herramientas que una organización podría contratar en el futuro.",
      hint: "Las actividades son ilustrativas: no representan clientes atendidos."
    },
    {
      section: "empresas", focus: "metrics", title: "Indicadores agregados simulados",
      description: "Muestra el prototipo del tablero empresarial sin exponer información personal ni clínica.",
      hint: "Aclara que las métricas son inventadas y no miden resultados reales."
    },
    {
      section: "planes", title: "Cómo funcionaría el negocio",
      description: "Compara la sesión individual, el plan mensual y los servicios de bienestar organizacional.",
      hint: "Los valores son de demostración; no hay pasarela de pagos."
    },
    {
      section: "demo", title: "Vista administrativa",
      description: "Conoce los indicadores calculados con las reservas ficticias guardadas en este navegador.",
      hint: "Al finalizar puedes restablecer los datos para otra exposición."
    }
  ]
};

type Props = {
  audience: GuideAudience;
  step: number;
  onStep: (step: number) => void;
  onClose: () => void;
};

export function GuidedExperience({ audience, step, onStep, onClose }: Props) {
  const sequence = demoFlows[audience];
  const item = sequence[step] ?? sequence[0];
  const isLast = step === sequence.length - 1;
  return <aside className="demo-guide" aria-label="Guía interactiva de la demostración">
    <div className="demo-guide-top">
      <span className="demo-guide-eyebrow">
        {audience === "empresas" ? <Building2 size={16} /> : <Heart size={16} />}
        RECORRIDO {audience === "empresas" ? "PARA EMPRESAS" : "PERSONAL"}
      </span>
      <button type="button" className="demo-guide-close" aria-label="Cerrar recorrido guiado" onClick={onClose}><X size={18}/></button>
    </div>
    <div className="demo-guide-progress" aria-label={`Paso ${step + 1} de ${sequence.length}`}>
      {sequence.map((entry, index) => <button type="button" key={entry.title}
        aria-label={`Ir al paso ${index + 1}: ${entry.title}`}
        aria-current={index === step ? "step" : undefined}
        onClick={() => onStep(index)}
        className={index <= step ? "done" : ""}/>)}
    </div>
    <div className="demo-guide-body" aria-live="polite" aria-atomic="true">
      <span className="demo-guide-count">PASO {step + 1} DE {sequence.length}</span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <small>{item.hint}</small>
    </div>
    <div className="demo-guide-actions">
      <button type="button" className="button button-outline" disabled={step === 0} onClick={() => onStep(step - 1)}><ArrowLeft size={16}/> Atrás</button>
      {isLast
        ? <button type="button" className="button button-primary" onClick={onClose}>Finalizar <CheckCircle2 size={17}/></button>
        : <button type="button" className="button button-primary" onClick={() => onStep(step + 1)}>Siguiente paso <ArrowRight size={17}/></button>}
    </div>
    <span className="demo-guide-note">Solo demostración: sin consultas, pagos ni usuarios reales.</span>
  </aside>;
}
