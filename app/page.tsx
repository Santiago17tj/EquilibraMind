"use client";

import { useEffect, useState } from "react";
import { RoleDashboard } from "./components/RoleDashboard";
import { BreathingExercise } from "./components/BreathingExercise";
import { GuidedExperience, demoFlows, type GuideAudience } from "./components/GuidedExperience";
import { DemoDiagnostics } from "./components/DemoDiagnostics";
import {
  specialists, loadDemoSnapshot, findActiveBooking, saveDemoBooking,
  cancelDemoBooking, resetDemoDatabase, setDemoSetting,
  type DemoSnapshot, type DemoRole, type VisitMode
} from "./lib/demo-db";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BrainCircuit,
  Building2, CalendarCheck2, CalendarDays, Check, CheckCircle2, ChevronDown,
  CircleHelp, ClipboardCheck, Clock3, Heart, HeartHandshake, Info, Leaf,
  LockKeyhole, Menu, MoonStar, PlayCircle, ShieldCheck, Sparkles, UserRound,
  UsersRound, Wind, Video, MapPin, RotateCcw, GraduationCap, BriefcaseBusiness, X
} from "lucide-react";

type Section = "inicio" | "chequeo" | "profesionales" | "empresas" | "planes" | "espacio" | "demo";
const nav: { id: Section; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "chequeo", label: "Mi bienestar" },
  { id: "profesionales", label: "Profesionales" },
  { id: "empresas", label: "Para empresas" },
  { id: "planes", label: "Planes" }
];
type ProfileFilter = "todos" | "laboral" | "estudiantil";
const profileFilters: { value: ProfileFilter; label: string }[] = [
  { value: "todos", label: "Todos los enfoques" },
  { value: "laboral", label: "Estrés laboral" },
  { value: "estudiantil", label: "Vida estudiantil" }
];
const questions = [
  "¿Con qué frecuencia terminas el día sintiéndote sin energía?",
  "¿Te resulta difícil desconectarte de tus responsabilidades?",
  "¿Sientes que tienes más tareas de las que puedes manejar?",
  "¿Tu descanso se ha visto afectado por preocupaciones laborales o académicas?",
  "¿Has notado menos interés en actividades que antes disfrutabas?",
  "¿Te cuesta encontrar momentos de calma durante la semana?"
];
const responseOptions = ["Nunca", "Algunas veces", "Con frecuencia", "Casi siempre"];
const slotOptions = ["9:00 a. m.", "11:30 a. m.", "3:00 p. m.", "5:00 p. m."];
const appointmentPrices: Record<VisitMode, number> = { virtual: 95000, presencial: 120000 };
const formatCOP = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const localDateISO = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const readableDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
};

function Logo({ onClick }: { onClick: () => void }) {
  return <button type="button" className="brand" onClick={onClick} aria-label="Volver al inicio">
    <span className="brand-mark"><BrainCircuit size={24} strokeWidth={1.8} /></span>
    <span>equilibra<span className="brand-strong">mind</span><span className="brand-dot">.</span></span>
  </button>;
}

function DemoNote({ compact = false }: { compact?: boolean }) {
  return <div className={"demo-note" + (compact ? " compact" : "")}>
    <Info size={16} aria-hidden="true" />
    <span><strong>Prototipo académico.</strong> Experiencia, profesionales, disponibilidad, resultados y pagos simulados. No presta atención psicológica real.</span>
  </div>;
}

function BrandFooter({ navigate }: { navigate: (v: Section) => void }) {
  return <footer className="footer">
    <div className="footer-grid">
      <div>
        <Logo onClick={() => navigate("inicio")} />
        <p>Un espacio para conectar contigo, reconocer tus necesidades y construir una relación más saludable con tu día a día.</p>
      </div>
      <div className="footer-links">
        <h4>Explora</h4>
        <button onClick={() => navigate("chequeo")}>Chequeo de bienestar</button>
        <button onClick={() => navigate("profesionales")}>Profesionales</button>
        <button onClick={() => navigate("planes")}>Nuestros planes</button>
      </div>
      <div className="footer-links">
        <h4>EquilibraMind</h4>
        <button onClick={() => navigate("empresas")}>Soluciones empresariales</button>
        <button onClick={() => navigate("espacio")}>Mi espacio de prueba</button>
        <button onClick={() => navigate("demo")}>Paneles por rol</button>
        <span>Desarrollado como proyecto académico · Colombia</span>
      </div>
    </div>
    <div className="footer-bottom"><span>© 2026 EquilibraMind. Demostración educativa.</span><span>Con calma. Con propósito. Contigo.</span></div>
  </footer>;
}

export default function Home() {
  const [view, setView] = useState<Section>("inicio");
  const [demoRole, setDemoRole] = useState<DemoRole>("paciente");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guideAudience, setGuideAudience] = useState<GuideAudience | null>(null);
  const [guideStep, setGuideStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [quizStep, setQuizStep] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedId, setSelectedId] = useState(1);
  const [profileFilter, setProfileFilter] = useState<ProfileFilter>("todos");
  const [expandedProfileId, setExpandedProfileId] = useState<number | null>(null);
  const [jumpToBooking, setJumpToBooking] = useState(false);
  const [cancelNotice, setCancelNotice] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHour, setBookingHour] = useState("");
  const [mode, setMode] = useState<VisitMode>("virtual");
  const [demoSnapshot, setDemoSnapshot] = useState<DemoSnapshot | null>(null);
  const [demoPatientId, setDemoPatientId] = useState("valentina");
  const [dbError, setDbError] = useState("");
  const [dbBusy, setDbBusy] = useState(false);
  const [bookedNotice, setBookedNotice] = useState(false);
  const [companyPreview, setCompanyPreview] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      setGuideAudience(null);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  // Transiciones discretas al aparecer en pantalla. No ocultan contenido si JS está desactivado.
  useEffect(() => {
    if (typeof window.IntersectionObserver === "undefined" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = document.querySelector(".site-shell main");
    if (!container) return;
    const selector = [
      ".value-bar > div", ".section-head", ".feature-card", ".wellbeing-art",
      ".split-copy", ".photo-feature-copy", ".photo-feature-visual",
      ".business-banner", ".closing-cta", ".subpage-head",
      ".specialist-card", ".profile-detail", ".booking-section",
      ".quiz-panel", ".quiz-aside", ".plan-card",
      ".company-benefits > div", ".company-callout", ".dashboard-preview",
      ".role-selector", ".role-dashboard", ".role-stat", ".role-panel",
      ".greeting-card", ".space-card"
    ].join(", ");
    const items = Array.from(container.querySelectorAll<HTMLElement>(selector))
      .filter((element) => !element.classList.contains("is-revealed"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    items.forEach((element, index) => {
      element.classList.add("reveal-on-scroll");
      element.style.setProperty("--reveal-delay", `${(index % 3) * 85}ms`);
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [view, profileFilter, expandedProfileId, companyPreview, demoRole, quizFinished]);

  useEffect(() => {
    let active = true;
    loadDemoSnapshot().then((snapshot) => {
      if (!active) return;
      setDemoSnapshot(snapshot);
      const preferred = snapshot.settings.patientId;
      const patientId = snapshot.patients.some((patient) => patient.id === preferred) ? preferred : "valentina";
      setDemoPatientId(patientId);
      setSelectedPlan(snapshot.settings[`plan:${patientId}`] ?? null);
      if (["paciente", "psicologo", "administrador"].includes(snapshot.settings.role)) {
        setDemoRole(snapshot.settings.role as DemoRole);
      }
      setDbError("");
      // El almacenamiento antiguo de una sola cita ya no es la fuente de datos.
      try { window.localStorage.removeItem("equilibramind-demo-booking-v1"); } catch {}
    }).catch((error: unknown) => {
      if (active) setDbError(error instanceof Error ? error.message : "No se pudo abrir la base local.");
    });
    return () => { active = false; };
  }, []);

  const refreshDemo = async () => {
    const updated = await loadDemoSnapshot();
    setDemoSnapshot(updated);
    return updated;
  };
  const selectDemoPatient = async (patientId: string) => {
    if (!demoSnapshot?.patients.some((patient) => patient.id === patientId)) return;
    setDemoPatientId(patientId);
    setSelectedPlan(demoSnapshot.settings[`plan:${patientId}`] ?? null);
    setCancelNotice(false);
    setBookedNotice(false);
    try {
      await setDemoSetting("patientId", patientId);
      await refreshDemo();
      setDbError("");
    } catch (error) {
      setDbError(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    }
  };
  const selectDemoRole = (role: DemoRole) => {
    setDemoRole(role);
    setDemoSetting("role", role).catch((error: unknown) =>
      setDbError(error instanceof Error ? error.message : "No se pudo guardar el rol.")
    );
  };
  const resetDemo = async () => {
    if (!window.confirm("¿Restablecer todos los personajes, planes y citas de prueba en ESTE navegador? Se perderán los cambios de esta demostración.")) return;
    setDbBusy(true); setDbError("");
    try {
      const initial = await resetDemoDatabase();
      setDemoSnapshot(initial);
      setDemoPatientId("valentina");
      setDemoRole("paciente");
      setSelectedPlan(null);
      setBookingDate(""); setBookingHour("");
      setCancelNotice(false); setBookedNotice(false);
      try { window.localStorage.removeItem("equilibramind-demo-booking-v1"); } catch {}
    } catch (error) {
      setDbError(error instanceof Error ? error.message : "No se pudo restablecer la demo.");
    } finally { setDbBusy(false); }
  };

  const navigate = (v: Section) => {
    setView(v);
    setMobileOpen(false);
    setBookedNotice(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
    window.requestAnimationFrame(() => {
      document.getElementById("contenido")?.focus({ preventScroll: true });
    });
  };
  const booking = demoSnapshot ? findActiveBooking(demoSnapshot, demoPatientId) : null;
  const currentDemoPatient = demoSnapshot?.patients.find((person) => person.id === demoPatientId) ?? null;
  const specialist = specialists.find((person) => person.id === selectedId) ?? specialists[0];
  const expandedProfile = specialists.find((person) => person.id === expandedProfileId);
  const visibleSpecialists = specialists.filter((person) => profileFilter === "todos" || person.category === profileFilter);
  const isDateValid = bookingDate !== "" && bookingDate >= localDateISO();
  // Evita mostrar horarios ya reservados por otros personajes en esta misma demo.
  // La cita propia continúa disponible cuando se está reprogramando.
  const occupiedSlots = demoSnapshot?.appointments
    .filter((item) =>
      item.status === "scheduled" &&
      item.professionalId === selectedId &&
      item.date === bookingDate &&
      item.id !== booking?.id
    )
    .map((item) => item.hour) ?? [];
  const isBookingReady = Boolean(demoSnapshot) && !dbBusy && isDateValid &&
    slotOptions.includes(bookingHour) && !occupiedSlots.includes(bookingHour);
  const total = answers.reduce((sum, item) => sum + Math.max(item, 0), 0);
  const category = total <= 5 ? "Una oportunidad para seguir cuidándote" : total <= 11 ? "Quizá necesites más momentos de equilibrio" : "Vale la pena prestar atención a tu bienestar";
  const guidance = total <= 5
    ? "Tus respuestas muestran pocas señales de sobrecarga en este ejercicio. Mantén espacios de descanso, conexión y hábitos sostenibles."
    : total <= 11
      ? "Varias de tus respuestas sugieren que las responsabilidades podrían estar ocupando demasiado espacio. Prueba a revisar tus límites y apoyos."
      : "Has señalado señales frecuentes de cansancio o sobrecarga. Considera hablar con una persona profesional habilitada y buscar apoyo en tu entorno.";
  const saveBooking = async () => {
    if (!isBookingReady) return;
    setDbBusy(true); setDbError("");
    try {
      await saveDemoBooking(demoPatientId, { professionalId: specialist.id, date: bookingDate, hour: bookingHour, mode });
      await refreshDemo();
      setBookedNotice(true); setCancelNotice(false);
    } catch (error) {
      setDbError(error instanceof Error ? error.message : "No se pudo guardar la reserva ficticia.");
    } finally { setDbBusy(false); }
  };
  const chooseSpecialist = (id: number) => {
    setSelectedId(id);
    setBookedNotice(false);
    setBookingDate("");
    setBookingHour("");
    document.getElementById("booking-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const beginReschedule = () => {
    if (!booking) return;
    const found = specialists.find((person) => person.name === booking.name);
    setSelectedId(found?.id ?? 1);
    setMode(booking.mode ?? "virtual");
    setBookingDate(booking.date >= localDateISO() ? booking.date : "");
    setBookingHour(slotOptions.includes(booking.hour) ? booking.hour : "");
    setJumpToBooking(true);
    navigate("profesionales");
  };
  const cancelBooking = async () => {
    if (!booking || !window.confirm("¿Cancelar esta reserva ficticia? El cambio quedará guardado en ESTE navegador.")) return;
    setDbBusy(true); setDbError("");
    try {
      await cancelDemoBooking(demoPatientId, booking.id);
      await refreshDemo();
      setBookedNotice(false); setCancelNotice(true);
    } catch (error) {
      setDbError(error instanceof Error ? error.message : "No se pudo cancelar.");
    } finally { setDbBusy(false); }
  };
  useEffect(() => {
    if (view === "profesionales" && jumpToBooking) {
      document.getElementById("booking-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setJumpToBooking(false);
    }
  }, [jumpToBooking, view]);
  useEffect(() => {
    if (view === "profesionales" && expandedProfileId !== null) {
      const animationFrame = window.requestAnimationFrame(() => document.getElementById("profile-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return () => window.cancelAnimationFrame(animationFrame);
    }
  }, [expandedProfileId, view]);
  const resetQuiz = () => { setAnswers(Array(questions.length).fill(-1)); setQuizStep(0); setQuizFinished(false); };
  const choosePlan = async (name: string) => {
    setSelectedPlan(name);
    navigate("espacio");
    try {
      await setDemoSetting(`plan:${demoPatientId}`, name);
      await refreshDemo();
    } catch (error) {
      setDbError(error instanceof Error ? error.message : "No se pudo guardar el plan de demostración.");
    }
  };

  const goGuideStep = (audience: GuideAudience, step: number) => {
    const flow = demoFlows[audience];
    const next = flow[step];
    if (!next) return;
    setGuideAudience(audience);
    setGuideStep(step);
    if (next.focus === "booking") setJumpToBooking(true);
    if (next.focus === "metrics") setCompanyPreview(true);
    if (next.section === "demo") selectDemoRole(audience === "empresas" ? "administrador" : "paciente");
    navigate(next.section);
    if (next.focus === "metrics") {
      window.setTimeout(() => document.getElementById("company-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
    }
  };
  const startGuide = (audience: GuideAudience) => goGuideStep(audience, 0);

  return <div className="site-shell">
    <a className="skip-to-content" href="#contenido">Saltar al contenido principal</a>
    <div className="top-strip"><Leaf size={13}/> Un espacio para cuidar de ti, a tu ritmo <span>·</span> Plataforma de demostración</div>
    <header className="header">
      <div className="header-inner">
        <Logo onClick={() => navigate("inicio")} />
        <nav id="nav-principal" className={mobileOpen ? "nav nav-open" : "nav"} aria-label="Navegación principal">
          {nav.map((entry) => <button key={entry.id} className={view === entry.id ? "nav-link active" : "nav-link"} aria-current={view === entry.id ? "page" : undefined} onClick={() => navigate(entry.id)}>{entry.label}</button>)}
          <button className="mobile-space-link" onClick={() => navigate("espacio")}>Mi espacio</button>
          <button className="mobile-space-link" onClick={() => navigate("demo")}>Probar roles</button>
          <button className="mobile-space-link" onClick={() => startGuide("personas")}>Recorrido guiado</button>
        </nav>
        <div className="header-actions">
          <button className="button button-ghost desktop-space" onClick={() => startGuide("personas")}><PlayCircle size={17}/> Ver recorrido</button>
          <button className="button button-primary header-cta" onClick={() => navigate("chequeo")}>Empezar <ArrowUpRight size={16}/></button>
          <button className="menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-controls="nav-principal" aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="contenido" key={view} tabIndex={-1} className="page-transition">
      {view === "inicio" && <>
        <section className="hero section-width">
          <div className="hero-content">
            <div className="eyebrow"><span className="sparkle-dot"/> EL BIENESTAR EMPIEZA POR TI</div>
            <h1>Está bien hacer una <em>pausa.</em><br/>Tu bienestar importa.</h1>
            <p className="hero-lead">En medio de tantas responsabilidades, también mereces un espacio para escucharte. Descubre herramientas para encontrar más equilibrio en tu vida laboral y personal.</p>
            <div className="hero-buttons">
              <button className="button button-primary button-large" onClick={() => navigate("chequeo")}>Conoce cómo te sientes <ArrowRight size={18}/></button>
              <button className="button button-outline button-large" onClick={() => navigate("profesionales")}>Explorar acompañamiento</button>
            </div>
            <div className="hero-guide-entry"><button type="button" onClick={() => startGuide("personas")}><PlayCircle size={18}/> Descubre cómo funciona, paso a paso <ArrowRight size={17}/></button><span>Demostración guiada con datos ficticios</span></div>
            <div className="hero-trust"><div className="trust-avatars"><span>✦</span><span>♡</span><span>☼</span></div><span>Una experiencia cálida, a tu ritmo y sin juicios</span></div>
          </div>
          <div className="hero-visual" aria-label="Imagen ilustrativa de una pausa para el bienestar" role="img">
            <img className="hero-generated-photo" src="/images/hero.avif?v=2" alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            <div className="visual-sun"/>
            <div className="visual-orbit orbit-one"/>
            <div className="visual-orbit orbit-two"/>
            <div className="visual-shape shape-back"/>
            <div className="visual-shape shape-front"/>
            <div className="visual-leaf leaf-a"/>
            <div className="visual-leaf leaf-b"/>
            <div className="visual-leaf leaf-c"/>
            <div className="floating-card float-left"><span className="floating-icon"><Heart size={18}/></span><span>Un momento para ti<small>Respira. Reconecta. Continúa.</small></span></div>
            <div className="floating-card float-right"><span className="floating-icon muted"><Sparkles size={18}/></span><span>Pequeños hábitos<small>Grandes cambios, paso a paso.</small></span></div>
            <span className="visual-sign">con calma, contigo.</span>
          </div>
        </section>
        <div className="value-bar section-width">
          <div><ShieldCheck size={22}/><span><strong>Sin juicios</strong><small>Un espacio de respeto</small></span></div>
          <div><HeartHandshake size={23}/><span><strong>A tu propio ritmo</strong><small>Recursos que acompañan</small></span></div>
          <div><Clock3 size={22}/><span><strong>Desde donde estés</strong><small>Una experiencia digital</small></span></div>
        </div>
        <section className="section-block section-width">
          <div className="section-head centered">
            <div className="eyebrow">TE ACOMPAÑAMOS A DAR EL PRIMER PASO</div>
            <h2>Cuidarte no debería sentirse <em>como otra tarea.</em></h2>
            <p>Diseñamos experiencias sencillas para reconocer cómo te sientes y descubrir formas de hacer espacio para tu bienestar.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card"><div className="feature-icon"><ClipboardCheck size={26}/></div><h3>Conecta con tu bienestar</h3><p>Responde un chequeo orientativo y reflexiona sobre cómo te has sentido últimamente.</p><button className="text-link" onClick={() => navigate("chequeo")}>Hacer el chequeo <ArrowRight size={17}/></button></article>
            <article className="feature-card"><div className="feature-icon peach-icon"><Heart size={26}/></div><h3>Encuentra acompañamiento</h3><p>Conoce los distintos enfoques de apoyo emocional a través de perfiles de demostración.</p><button className="text-link" onClick={() => navigate("profesionales")}>Conocer perfiles <ArrowRight size={17}/></button></article>
            <article className="feature-card"><div className="feature-icon lilac-icon"><Wind size={26}/></div><h3>Haz espacio para respirar</h3><p>Explora prácticas cotidianas de autocuidado que puedes integrar a tu rutina.</p><button className="text-link" onClick={() => navigate("espacio")}>Ir a mi espacio <ArrowRight size={17}/></button></article>
          </div>
        </section>
        <section className="soft-section">
          <div className="section-width split-content">
            <div className="wellbeing-art"><div className="wellbeing-circle"><span>“</span><p>Tu bienestar<br/>no es un lujo.<br/><em>Es parte de ti.</em></p></div><div className="art-leaf a"/><div className="art-leaf b"/></div>
            <div className="split-copy"><div className="eyebrow">UNA IDEA QUE NACE DEL CUIDADO</div><h2>Tu vida es mucho más que <em>tu lista de pendientes.</em></h2><p>El agotamiento puede aparecer cuando las exigencias no dejan espacio para descansar. Reconocer tus necesidades es un punto de partida para recuperar el equilibrio.</p><div className="check-row"><CheckCircle2 size={19}/> Información educativa y accesible</div><div className="check-row"><CheckCircle2 size={19}/> Herramientas para la reflexión personal</div><div className="check-row"><CheckCircle2 size={19}/> Opciones de acompañamiento a futuro</div><button className="button button-primary" onClick={() => navigate("chequeo")}>Dar mi primer paso <ArrowRight size={17}/></button></div>
          </div>
        </section>
        <section className="experiential-section section-width">
          <div className="experiential-copy">
            <div className="eyebrow"><span className="sparkle-dot"/> TU BIENESTAR, UN PASO A LA VEZ</div>
            <h2>Antes de seguir, date <em>un momento para ti.</em></h2>
            <p>Cuando las responsabilidades pesan, a veces necesitamos un instante sin exigencias. Prueba este ejercicio interactivo y descubre cómo se sentiría EquilibraMind como compañero de tu rutina.</p>
            <div className="experience-note"><Wind size={22}/><span>Un minuto de respiración consciente. Sin formularios. Sin juicios. A tu propio ritmo.</span></div>
            <button className="text-link" onClick={() => navigate("chequeo")}>Después, conoce tu bienestar <ArrowRight size={18}/></button>
          </div>
          <BreathingExercise />
        </section>
        <section className="photo-feature-section section-width">
          <div className="photo-feature-copy">
            <div className="eyebrow">UNA EXPERIENCIA DIGITAL PENSADA PARA PERSONAS</div>
            <h2>Hablar de lo que sientes también puede ser <em>un primer paso.</em></h2>
            <p>Conoce cómo sería recibir acompañamiento virtual desde un lugar cómodo para ti. Esta escena es una ilustración generada con IA; las consultas reales no están disponibles todavía.</p>
            <button className="button button-primary" onClick={() => navigate("profesionales")}>Conocer opciones de atención <ArrowRight size={17}/></button>
          </div>
          <figure className="photo-feature-visual"><img src="/images/teleconsulta.avif?v=2" loading="lazy" alt="Escena ilustrativa generada con IA de una videoconsulta psicológica de demostración"/><figcaption>Imagen generada con IA · No representa una consulta real</figcaption></figure>
        </section>
        <section className="section-block section-width business-banner"><div><div className="eyebrow">BIENESTAR QUE TAMBIÉN SE COMPARTE</div><h2>Equipos más humanos. <em>Entornos más saludables.</em></h2><p>Conoce cómo EquilibraMind podría ayudar a las empresas a promover una cultura de cuidado y prevención del agotamiento laboral.</p><button className="button button-dark" onClick={() => navigate("empresas")}>EquilibraMind para empresas <ArrowRight size={18}/></button>
          <button className="business-guide-link" onClick={() => startGuide("empresas")}><PlayCircle size={17}/> Ver recorrido empresarial</button></div><div className="business-art business-art-photo"><img src="/images/empresas.avif?v=2" alt="Grupo ilustrativo de personas en un taller de bienestar, imagen generada con IA" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div className="business-heart"><Heart size={32} fill="currentColor" strokeWidth={1}/></div></div></section>
        <section className="closing-cta section-width"><div className="eyebrow">CADA PASO CUENTA</div><h2>Tu bienestar también <em>merece espacio.</em></h2><p>Comienza con unos minutos para descubrir cómo te has sentido.</p><button className="button button-primary button-large" onClick={() => navigate("chequeo")}>Comenzar mi chequeo <ArrowRight size={18}/></button></section>
      </>}

      {view === "chequeo" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">TU MOMENTO DE PAUSA</div><h1>¿Cómo te has <em>sentido últimamente?</em></h1><p>Un pequeño espacio para reconocer tu nivel de carga cotidiana. No hay respuestas buenas ni malas.</p></div>
        <div className="quiz-layout">
          <div className="quiz-panel">
            {!quizFinished ? <>
              <div className="quiz-top"><span>PREGUNTA {quizStep + 1} DE {questions.length}</span><span>{Math.round((quizStep / questions.length) * 100)}% completado</span></div>
              <div className="progress-track" role="progressbar" aria-label="Progreso del chequeo" aria-valuenow={quizStep} aria-valuemin={0} aria-valuemax={questions.length}><div style={{ width: String((quizStep / questions.length) * 100) + "%" }}/></div>
              <h2 aria-live="polite">{questions[quizStep]}</h2>
              <div className="answer-list">{responseOptions.map((option, index) => <button key={option} type="button" aria-pressed={answers[quizStep] === index} className={answers[quizStep] === index ? "answer-option selected" : "answer-option"} onClick={() => setAnswers((all) => all.map((a, i) => i === quizStep ? index : a))}><span className="radio-dot"/>{option}</button>)}</div>
              <div className="quiz-actions"><button className="button button-ghost" onClick={() => setQuizStep((s) => Math.max(s - 1, 0))} disabled={quizStep === 0}><ArrowLeft size={17}/> Anterior</button><button className="button button-primary" disabled={answers[quizStep] === -1} onClick={() => quizStep === questions.length - 1 ? setQuizFinished(true) : setQuizStep((s) => s + 1)}>{quizStep === questions.length - 1 ? "Ver mi reflexión" : "Continuar"} <ArrowRight size={17}/></button></div>
            </> : <div className="quiz-result" role="status"><span className="result-icon"><Leaf size={34}/></span><div className="eyebrow">TU REFLEXIÓN PERSONAL</div><h2>{category}</h2><p>{guidance}</p><div className="result-hint"><Info size={19}/><span>Este cuestionario es una actividad educativa creada para la demostración, sin validación psicométrica. No mide ni diagnostica burnout ni sustituye la evaluación profesional.</span></div><div className="result-buttons"><button className="button button-primary" onClick={() => navigate("profesionales")}>Conocer profesionales <ArrowRight size={17}/></button><button className="button button-outline" onClick={() => navigate("planes")}>Ver modalidades y precios</button><button className="button button-ghost" onClick={resetQuiz}>Repetir ejercicio</button></div></div>}
          </div>
          <aside className="quiz-aside"><div className="quiz-student-image"><img src="/images/estudiantes.avif?v=2" alt="Estudiante ficticio tomándose una pausa, imagen generada con IA" loading="lazy"/><span>Escena ilustrativa · IA</span></div><span className="aside-illustration"><MoonStar size={36}/></span><h3>Un momento solo para ti.</h3><p>Tómate tu tiempo. Tus respuestas no se envían a ningún servidor ni se guardan en tu perfil.</p><div className="aside-divider"/><div className="aside-item"><LockKeyhole size={18}/> Sin crear una cuenta</div><div className="aside-item"><Clock3 size={18}/> Aproximadamente 2 minutos</div><div className="aside-item"><Heart size={18}/> Sin juicios ni etiquetas</div></aside>
        </div>
      </section>}

      {view === "profesionales" && <section className="inner-section section-width">
        <div className="subpage-head">
          <div className="eyebrow">ACOMPAÑAMIENTO CON UN ENFOQUE HUMANO</div>
          <h1>Cada historia merece <em>ser escuchada.</em></h1>
          <p>Explora distintas áreas de la psicología y conoce cómo sería elegir un profesional. Los nombres, trayectorias y perfiles que ves aquí son inventados para esta demostración.</p>
        </div>
        <div className="profile-filter-row" role="group" aria-label="Filtrar profesionales por enfoque">
          {profileFilters.map((filter) => <button type="button" key={filter.value} className={profileFilter === filter.value ? "filter-chip active" : "filter-chip"} aria-pressed={profileFilter === filter.value} onClick={() => {setProfileFilter(filter.value); setExpandedProfileId(null);}}>{filter.label}</button>)}
        </div>
        <div className="specialist-grid">
          {visibleSpecialists.map((person) => <article className="specialist-card" key={person.id}>
            <div className={"specialist-photo " + person.color} aria-label={"Retrato ilustrativo del personaje ficticio " + person.name}>
              <div className="portrait-orbit"/><div className="avatar-bust"><span>{person.initials}</span></div>
              <img className="specialist-generated-photo" loading="lazy" decoding="async" width={1122} height={1402} src={person.id === 1 ? "/images/laura.avif" : person.id === 2 ? "/images/daniela-v2.avif" : "/images/julian.avif"} alt={"Retrato generado con IA de " + person.name + ", personaje ficticio"} onError={(event) => {event.currentTarget.style.display = "none";}} />
              <div className="profile-label">PERSONAJE FICTICIO · IA</div>
            </div>
            <div className="specialist-info">
              <div className="tag">Perfil de demostración · 50 minutos</div>
              <h3>{person.name}</h3>
              <span className="role-name">{person.role}</span>
              <p>{person.focus}</p>
              <div className="profile-mini-tags">{person.approaches.slice(0,2).map((topic) => <span key={topic}>{topic}</span>)}</div>
              <div className="specialist-bottom"><span><Clock3 size={15}/>{person.experience}</span></div>
              <div className="profile-price-row"><span>Teleconsulta de ejemplo</span><strong>{formatCOP(appointmentPrices.virtual)}</strong></div>
              <div className="profile-card-actions">
                <button type="button" className="button button-outline" aria-expanded={expandedProfileId === person.id} onClick={() => setExpandedProfileId(expandedProfileId === person.id ? null : person.id)}>{expandedProfileId === person.id ? "Cerrar ficha" : "Ver perfil"} <ArrowRight size={15}/></button>
                <button type="button" className="button button-primary" onClick={() => chooseSpecialist(person.id)}>Agendar demo <CalendarDays size={15}/></button>
              </div>
            </div>
          </article>)}
        </div>
        {expandedProfile && <section id="profile-detail" className="profile-detail" aria-label={"Ficha ficticia de " + expandedProfile.name}>
          <div className="profile-detail-top">
            <span className={"mini-avatar " + expandedProfile.color}>{expandedProfile.initials}</span>
            <div><span className="eyebrow">FICHA DEL PROFESIONAL · DEMOSTRACIÓN</span><h2>{expandedProfile.name}</h2><p>{expandedProfile.role} · {expandedProfile.audience}</p></div>
            <button type="button" className="profile-close" onClick={() => setExpandedProfileId(null)} aria-label="Cerrar ficha"><X size={19}/></button>
          </div>
          <div className="profile-detail-grid">
            <div><h3>Sobre este enfoque</h3><p>{expandedProfile.bio}</p><p className="profile-education"><GraduationCap size={17}/>{expandedProfile.education}</p></div>
            <div><h3>Áreas de acompañamiento</h3><div className="profile-detail-tags">{expandedProfile.approaches.map((topic) => <span key={topic}><Check size={14}/>{topic}</span>)}</div><p className="profile-meta"><Video size={17}/> Teleconsulta simulada · 50 min · {formatCOP(appointmentPrices.virtual)}</p><p className="profile-meta"><MapPin size={17}/> Presencial en Bucaramanga: modalidad futura, sin consultorio habilitado</p></div>
          </div>
          <div className="profile-detail-bottom"><span><Info size={16}/> Ficha, formación y experiencia inventadas. No representan profesionales reales.</span><button className="button button-primary" onClick={() => chooseSpecialist(expandedProfile.id)}>Reservar cita de prueba <ArrowRight size={17}/></button></div>
        </section>}
        <div className="booking-section" id="booking-panel">
          <div className="booking-intro">
            <div className="eyebrow">AGENDA DE DEMOSTRACIÓN</div>
            <h2>Un primer paso, <em>cuando tú decidas.</em></h2>
            <p>Simula el proceso de reserva: elige modalidad, fecha y hora, revisa el valor y confirma. No se ofrece atención, no hay disponibilidad real y no debes ingresar información personal.</p>
            <div className="booking-person"><span className={"mini-avatar " + specialist.color}>{specialist.initials}</span><div><strong>{specialist.name}</strong><small>{specialist.role} · Perfil ficticio</small></div></div>
            <div className="booking-steps"><span className="step-pill"><CheckCircle2 size={16}/> Profesional</span><span className="step-pill">2. Modalidad y hora</span><span className="step-pill">3. Confirmación demo</span></div>
            <div className="booking-soft-warning"><Info size={18}/><span>Los horarios son ilustrativos, sin verificación de agenda. La modalidad presencial está prevista para una etapa futura.</span></div>
          </div>
          <div className="booking-form">
            <label htmlFor="booking-patient">Personaje de paciente para esta demo</label>
            <select id="booking-patient" value={demoPatientId} disabled={!demoSnapshot || dbBusy} onChange={event => selectDemoPatient(event.target.value)}>
              {(demoSnapshot?.patients ?? []).map(person => <option key={person.id} value={person.id}>{person.label}</option>)}
            </select>
            <label htmlFor="professional">Profesional de ejemplo</label>
            <select id="professional" value={selectedId} onChange={(event) => {setSelectedId(Number(event.target.value)); setBookingHour(""); setBookedNotice(false);}}>{specialists.map((person) => <option key={person.id} value={person.id}>{person.name} — {person.role}</option>)}</select>
            <fieldset className="modality-picker">
              <legend>¿Cómo prefieres tu sesión?</legend>
              <div className="modality-options">
                <label className={mode === "virtual" ? "modality-option chosen" : "modality-option"}>
                  <input type="radio" name="appointment-mode" value="virtual" checked={mode === "virtual"} onChange={() => {setMode("virtual"); setBookedNotice(false);}}/>
                  <span className="modality-option-body"><Video size={20}/><strong>Teleconsulta</strong><small>En línea · 50 minutos</small><b>{formatCOP(appointmentPrices.virtual)}</b></span>
                </label>
                <label className={mode === "presencial" ? "modality-option chosen" : "modality-option"}>
                  <input type="radio" name="appointment-mode" value="presencial" checked={mode === "presencial"} onChange={() => {setMode("presencial"); setBookedNotice(false);}}/>
                  <span className="modality-option-body"><MapPin size={20}/><strong>Presencial</strong><small>Bucaramanga · futura · 50 minutos</small><b>{formatCOP(appointmentPrices.presencial)}</b></span>
                </label>
              </div>
            </fieldset>
            <div className="modality-disclaimer"><Info size={16}/><span>{mode === "virtual" ? "Teleconsulta solo como simulación; no se genera videollamada ni se asigna un profesional real." : "Atención presencial propuesta para una etapa futura. No existe sede clínica, dirección o agenda presencial disponible."}</span></div>
            <label htmlFor="date">Elige un día (simulado)</label>
            <input id="date" type="date" value={bookingDate} min={localDateISO()} onChange={(event) => {setBookingDate(event.target.value); setBookingHour(""); setBookedNotice(false);}}/>
            <label htmlFor="hour">Horario de ejemplo</label>
            <select id="hour" value={bookingHour} onChange={(event) => {setBookingHour(event.target.value); setBookedNotice(false);}} aria-describedby="hour-guidance" disabled={!isDateValid}>
              <option value="">Selecciona una hora</option>{slotOptions.map((slot) => <option key={slot} value={slot} disabled={occupiedSlots.includes(slot)}>{slot}{occupiedSlots.includes(slot) ? " · Ocupado en la demo" : ""}</option>)}
            </select>
            <p id="hour-guidance" className="booking-hour-help" role="status">{!isDateValid ? "Selecciona primero un día válido." : occupiedSlots.length > 0 ? occupiedSlots.length + " horario(s) reservado(s) en esta agenda ficticia. Elige uno disponible." : "Los horarios son ilustrativos, sin disponibilidad clínica real."}</p>
            <div className="booking-summary">
              <div><span>Sesión {mode === "virtual" ? "virtual" : "presencial"} · 50 minutos</span><strong>{formatCOP(appointmentPrices[mode])}</strong></div>
              <small>{isBookingReady ? readableDate(bookingDate) + " · " + bookingHour + " · " + specialist.name : "Selecciona fecha y horario para completar el resumen."}</small>
              <small>Precio ilustrativo en COP. No se cobra ni se confirma ninguna atención real.</small>
            </div>
            <button type="button" className="button button-primary button-full" onClick={saveBooking} disabled={!isBookingReady}>{dbBusy ? "Guardando reserva..." : "Confirmar reserva ficticia"} <CalendarCheck2 size={18}/></button>
            {bookedNotice && <div className="success-message" role="status"><CheckCircle2 size={18}/> ¡Reserva de demostración guardada! <button onClick={() => navigate("espacio")}>Ver en Mi espacio</button></div>}
          </div>
        </div>
      </section>}

      {view === "empresas" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">EQUILIBRAMIND PARA EMPRESAS</div><h1>El bienestar de tu equipo <em>también es parte del éxito.</em></h1><p>Una propuesta para promover la prevención del agotamiento laboral, la escucha y una cultura de cuidado dentro de las organizaciones.</p><div className="company-primary-actions"><button className="button button-primary" aria-expanded={companyPreview} aria-controls="company-dashboard" onClick={() => setCompanyPreview(!companyPreview)}>{companyPreview ? "Ocultar panel" : "Explorar panel de empresa"} <BarChart3 size={17}/></button><button className="button button-outline" onClick={() => startGuide("empresas")}><PlayCircle size={17}/> Presentar propuesta B2B</button></div></div>
        <div className="company-benefits"><div><UsersRound size={27}/><h3>Cultura de cuidado</h3><p>Recursos de psicoeducación para conversaciones más saludables.</p></div><div><Activity size={27}/><h3>Bienestar colectivo</h3><p>Indicadores de ejemplo para identificar tendencias de participación.</p></div><div><ShieldCheck size={27}/><h3>Privacidad por diseño</h3><p>Un enfoque de reportes agregados, sin respuestas clínicas individuales.</p></div></div>
        {companyPreview ? <div className="dashboard-preview" id="company-dashboard"><div className="dashboard-header"><div><div className="eyebrow">PANEL EMPRESARIAL · SIMULACIÓN</div><h2>Resumen de bienestar</h2><span>Empresa ficticia: Horizonte Creativo S. A. S.</span></div><span className="demo-tag">DATOS SIMULADOS</span></div><div className="metric-grid"><div><span>Participación</span><strong>78%</strong><small>De colaboradores ficticios</small></div><div><span>Recursos explorados</span><strong>246</strong><small>Interacciones de ejemplo</small></div><div><span>Satisfacción estimada</span><strong>4,7/5</strong><small>Valor ficticio</small></div></div><div className="bar-visual"><h3>Interés por recursos de bienestar · Datos ficticios</h3>{[{l:"Gestión del estrés",w:83},{l:"Descanso y desconexión",w:65},{l:"Organización del tiempo",w:48}].map((item) => <div className="bar-item" key={item.l}><span>{item.l}</span><div><i style={{ width: String(item.w) + "%" }}/></div></div>)}</div><p className="dashboard-disclaimer"><Info size={16}/> Los indicadores no provienen de personas reales; ilustran un modelo de negocio potencial.</p></div> : <div className="company-callout"><span><BarChart3 size={40}/></span><div><h2>Una mirada humana a los datos.</h2><p>Abre el panel de demostración y descubre cómo podrían visualizarse indicadores agregados de un programa de bienestar.</p></div><button className="button button-dark" onClick={() => setCompanyPreview(true)}>Ver demostración <ArrowRight size={17}/></button></div>}
        <div className="company-bottom"><h2>Una propuesta a la medida <em>de cada equipo.</em></h2><p>Explora nuestro modelo corporativo ficticio y cómo podría evolucionar a un servicio contratado por organización.</p><button className="button button-outline" onClick={() => navigate("planes")}>Conocer planes <ArrowRight size={17}/></button></div>
      </section>}

      {view === "planes" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">PLANES PENSADOS PARA CADA NECESIDAD</div><h1>Elige cómo empezar <em>a cuidarte.</em></h1><p>Precios ilustrativos en pesos colombianos para validar el modelo de negocio. Sin transacciones ni cobros reales.</p></div>
        <div className="plan-grid">
          <article className="plan-card"><div className="plan-kicker">A TU RITMO</div><h3>Sesión individual</h3><p>Para quienes prefieren explorar el acompañamiento sin compromisos mensuales.</p><div className="price">$95.000 <small>COP / teleconsulta de 50 min · demo</small></div><div className="plan-divider"/><div className="plan-item"><Check size={17}/> Presencial proyectada: $120.000 COP</div><div className="plan-item"><Check size={17}/> Reserva y pago simulados</div><div className="plan-item"><Check size={17}/> Selección de profesional</div><div className="plan-item"><Check size={17}/> Recursos de bienestar</div><button className="button button-outline button-full" onClick={() => choosePlan("Sesión individual")}>Seleccionar plan demo <ArrowRight size={16}/></button></article>
          <article className="plan-card featured"><div className="recommended-label">MÁS COMPLETO · DEMO</div><div className="plan-kicker">ACOMPAÑAMIENTO CONSTANTE</div><h3>Equilibrio mensual</h3><p>Una propuesta de apoyo sostenido y hábitos saludables para el día a día.</p><div className="price">$279.000 <small>COP / mes · demo</small></div><div className="plan-divider"/><div className="plan-item"><Check size={17}/> Tres sesiones simuladas al mes</div><div className="plan-item"><Check size={17}/> Biblioteca de autocuidado</div><div className="plan-item"><Check size={17}/> Seguimiento orientativo</div><button className="button button-primary button-full" onClick={() => choosePlan("Equilibrio mensual")}>Seleccionar plan demo <ArrowRight size={16}/></button></article>
          <article className="plan-card"><div className="plan-kicker">BIENESTAR COLECTIVO</div><h3>Empresas</h3><p>Un modelo flexible para programas de bienestar y cultura organizacional.</p><div className="price price-custom">A medida <small>Propuesta comercial · demo</small></div><div className="plan-divider"/><div className="plan-item"><Check size={17}/> Talleres psicoeducativos</div><div className="plan-item"><Check size={17}/> Recursos para trabajadores</div><div className="plan-item"><Check size={17}/> Panel de indicadores agregados</div><button className="button button-outline button-full" onClick={() => navigate("empresas")}>Explorar empresas <ArrowRight size={16}/></button></article>
        </div><DemoNote />
      </section>}

      {view === "demo" && <section className="inner-section section-width">
        <RoleDashboard snapshot={demoSnapshot} booking={booking} selectedRole={demoRole} setSelectedRole={selectDemoRole}
          currentPatientId={demoPatientId} onSelectPatient={selectDemoPatient} onReset={resetDemo}
          onViewBooking={() => navigate("espacio")} onChooseProfessional={() => navigate("profesionales")} />
        <DemoDiagnostics />
      </section>

      {view === "espacio" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">UN ESPACIO PARA TI</div><h1>Bienvenida a <em>tu momento de calma.</em></h1><p>Un panel personal simulado para descubrir cómo se sentiría usar EquilibraMind cada día.</p></div>
        <div className="space-grid"><div className="space-main"><div className="greeting-card"><span className="tiny-label">PERFIL DE PRUEBA · {(currentDemoPatient?.name ?? "PACIENTE").toUpperCase()}</span><h2>Hoy también puedes darte un respiro.</h2><p>Los pequeños momentos de cuidado también cuentan.</p><span className="greeting-spark"><Sparkles size={43}/></span></div>
          <div className="space-card">
            <label className="local-field-label" htmlFor="space-patient">Cambiar personaje de prueba</label>
            <select className="local-picker" id="space-patient" value={demoPatientId} disabled={!demoSnapshot || dbBusy} onChange={event => selectDemoPatient(event.target.value)}>
              {(demoSnapshot?.patients ?? []).map(person => <option key={person.id} value={person.id}>{person.label}</option>)}
            </select>
            <div className="space-title"><h3><CalendarDays size={21}/> Mi cita de demostración</h3><span>DEMO</span></div>
            {booking ? <>
              <div className="appointment-item">
                <span className="appointment-icon"><CalendarCheck2 size={25}/></span>
                <div><strong>{booking.name}</strong><span>{booking.role}</span><small>{readableDate(booking.date)} · {booking.hour}</small><small>{booking.mode === "presencial" ? "Presencial futura (simulación)" : "Teleconsulta (simulación)"} · 50 minutos</small><small>Precio ilustrativo: {formatCOP(booking.price ?? appointmentPrices[booking.mode ?? "virtual"])}</small></div>
              </div>
              <p className="muted-text">Esta reserva es ficticia y solo existe en este navegador. No hay cita médica, videollamada, consultorio ni pago real.</p>
              <div className="appointment-actions">
                <button className="button button-outline" onClick={beginReschedule}><RotateCcw size={16}/> Cambiar cita demo</button>
                <button className="button cancel-button" disabled={dbBusy} onClick={cancelBooking}>Cancelar reserva demo</button>
              </div>
            </> : <>
              {cancelNotice && <p className="cancel-notice" role="status"><CheckCircle2 size={17}/> La reserva ficticia fue cancelada y eliminada de este navegador.</p>}
              <p className="muted-text">Aún no tienes reservas de ejemplo en este navegador. Puedes simular una en menos de dos minutos.</p>
              <button className="button button-outline" onClick={() => navigate("profesionales")}>Explorar profesionales <ArrowRight size={16}/></button>
            </>}
          </div>
          {selectedPlan && <div className="space-card"><div className="space-title"><h3><CheckCircle2 size={21}/> Plan de ejemplo</h3><span>NO CONTRATADO</span></div><p>Seleccionaste <strong>{selectedPlan}</strong> para explorar el modelo comercial. No se ha realizado ningún pago ni suscripción.</p></div>}
        </div><aside className="space-side"><div className="space-card"><h3>Tu pausa de hoy <Leaf size={19}/></h3><p>¿Has respirado profundo hoy? Prueba inhalar suavemente, exhalar sin prisa y reconocer cómo te sientes.</p><BreathingExercise compact /></div><div className="space-card"><h3>Continúa explorando</h3><button className="shortcut" onClick={() => { resetQuiz(); navigate("chequeo"); }}><ClipboardCheck size={20}/> Chequeo orientativo <ArrowRight size={16}/></button><button className="shortcut" onClick={() => navigate("planes")}><HeartHandshake size={20}/> Planes de ejemplo <ArrowRight size={16}/></button></div></aside></div>
      </section>}
    </main>
    {dbError && <div className="local-data-error" role="alert"><Info size={18}/><span>{dbError}</span><button type="button" onClick={() => setDbError("")}>Cerrar</button></div>}
    <DemoNote compact />
    {!guideAudience && <nav className="mobile-quick-nav" aria-label="Accesos rápidos">
      <button type="button" aria-current={view === "inicio" ? "page" : undefined} onClick={() => navigate("inicio")}><Leaf size={20}/> Inicio</button>
      <button type="button" aria-current={view === "profesionales" ? "page" : undefined} onClick={() => navigate("profesionales")}><CalendarDays size={20}/> Citas</button>
      <button type="button" onClick={() => startGuide("personas")}><PlayCircle size={20}/> Recorrido</button>
    </nav>}
    {guideAudience && <GuidedExperience audience={guideAudience} step={guideStep}
      onStep={(step) => goGuideStep(guideAudience, step)} onClose={() => setGuideAudience(null)}/>}
    <BrandFooter navigate={navigate} />
  </div>;
}
