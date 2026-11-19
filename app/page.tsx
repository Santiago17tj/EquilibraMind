"use client";

import { useEffect, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BrainCircuit,
  Building2, CalendarCheck2, CalendarDays, Check, CheckCircle2, ChevronDown,
  CircleHelp, ClipboardCheck, Clock3, Heart, HeartHandshake, Info, Leaf,
  LockKeyhole, Menu, MoonStar, PlayCircle, ShieldCheck, Sparkles, UserRound,
  UsersRound, Wind, X
} from "lucide-react";

type Section = "inicio" | "chequeo" | "profesionales" | "empresas" | "planes" | "espacio";
type Booking = { name: string; role: string; date: string; hour: string };
const nav: { id: Section; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "chequeo", label: "Mi bienestar" },
  { id: "profesionales", label: "Profesionales" },
  { id: "empresas", label: "Para empresas" },
  { id: "planes", label: "Planes" }
];
const specialists = [
  { id: 1, name: "Laura Méndez", role: "Psicología clínica", focus: "Estrés laboral y regulación emocional", initials: "LM", color: "peach", experience: "6 años · Experiencia ficticia" },
  { id: 2, name: "Daniela Ríos", role: "Bienestar estudiantil", focus: "Ansiedad académica y hábitos de estudio", initials: "DR", color: "lilac", experience: "4 años · Experiencia ficticia" },
  { id: 3, name: "Julián Herrera", role: "Psicología organizacional", focus: "Prevención del burnout y equilibrio laboral", initials: "JH", color: "sage", experience: "8 años · Experiencia ficticia" }
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
        <span>Desarrollado como proyecto académico · Colombia</span>
      </div>
    </div>
    <div className="footer-bottom"><span>© 2026 EquilibraMind. Demostración educativa.</span><span>Con calma. Con propósito. Contigo.</span></div>
  </footer>;
}

export default function Home() {
  const [view, setView] = useState<Section>("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [quizStep, setQuizStep] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedId, setSelectedId] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHour, setBookingHour] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookedNotice, setBookedNotice] = useState(false);
  const [companyPreview, setCompanyPreview] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    try {
      const previous = window.localStorage.getItem("equilibramind-demo-booking-v1");
      if (previous) {
        const parsed = JSON.parse(previous) as Booking;
        if (parsed && typeof parsed.name === "string" && typeof parsed.date === "string") setBooking(parsed);
      }
    } catch {
      // Local demo storage is optional.
    }
  }, []);

  const navigate = (v: Section) => {
    setView(v);
    setMobileOpen(false);
    setBookedNotice(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const specialist = specialists.find((person) => person.id === selectedId) ?? specialists[0];
  const total = answers.reduce((sum, item) => sum + Math.max(item, 0), 0);
  const category = total <= 5 ? "Una oportunidad para seguir cuidándote" : total <= 11 ? "Quizá necesites más momentos de equilibrio" : "Vale la pena prestar atención a tu bienestar";
  const guidance = total <= 5
    ? "Tus respuestas muestran pocas señales de sobrecarga en este ejercicio. Mantén espacios de descanso, conexión y hábitos sostenibles."
    : total <= 11
      ? "Varias de tus respuestas sugieren que las responsabilidades podrían estar ocupando demasiado espacio. Prueba a revisar tus límites y apoyos."
      : "Has señalado señales frecuentes de cansancio o sobrecarga. Considera hablar con una persona profesional habilitada y buscar apoyo en tu entorno.";
  const saveBooking = () => {
    if (!bookingDate || !bookingHour) return;
    const next = { name: specialist.name, role: specialist.role, date: bookingDate, hour: bookingHour };
    setBooking(next);
    setBookedNotice(true);
    try { window.localStorage.setItem("equilibramind-demo-booking-v1", JSON.stringify(next)); } catch {}
  };
  const resetQuiz = () => { setAnswers(Array(questions.length).fill(-1)); setQuizStep(0); setQuizFinished(false); };
  const choosePlan = (name: string) => { setSelectedPlan(name); navigate("espacio"); };

  return <div className="site-shell">
    <div className="top-strip"><Leaf size={13}/> Un espacio para cuidar de ti, a tu ritmo <span>·</span> Plataforma de demostración</div>
    <header className="header">
      <div className="header-inner">
        <Logo onClick={() => navigate("inicio")} />
        <nav className={mobileOpen ? "nav nav-open" : "nav"} aria-label="Navegación principal">
          {nav.map((entry) => <button key={entry.id} className={view === entry.id ? "nav-link active" : "nav-link"} onClick={() => navigate(entry.id)}>{entry.label}</button>)}
          <button className="mobile-space-link" onClick={() => navigate("espacio")}>Mi espacio</button>
        </nav>
        <div className="header-actions">
          <button className="button button-ghost desktop-space" onClick={() => navigate("espacio")}><UserRound size={16}/> Mi espacio</button>
          <button className="button button-primary header-cta" onClick={() => navigate("chequeo")}>Empezar <ArrowUpRight size={16}/></button>
          <button className="menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="contenido">
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
            <div className="hero-trust"><div className="trust-avatars"><span>✦</span><span>♡</span><span>☼</span></div><span>Una experiencia cálida, a tu ritmo y sin juicios</span></div>
          </div>
          <div className="hero-visual" aria-label="Ilustración abstracta de bienestar y tranquilidad" role="img">
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
        <section className="section-block section-width business-banner"><div><div className="eyebrow">BIENESTAR QUE TAMBIÉN SE COMPARTE</div><h2>Equipos más humanos. <em>Entornos más saludables.</em></h2><p>Conoce cómo EquilibraMind podría ayudar a las empresas a promover una cultura de cuidado y prevención del agotamiento laboral.</p><button className="button button-dark" onClick={() => navigate("empresas")}>EquilibraMind para empresas <ArrowRight size={18}/></button></div><div className="business-art"><Building2 size={104} strokeWidth={1.1}/><div className="business-heart"><Heart size={32} fill="currentColor" strokeWidth={1}/></div></div></section>
        <section className="closing-cta section-width"><div className="eyebrow">CADA PASO CUENTA</div><h2>Tu bienestar también <em>merece espacio.</em></h2><p>Comienza con unos minutos para descubrir cómo te has sentido.</p><button className="button button-primary button-large" onClick={() => navigate("chequeo")}>Comenzar mi chequeo <ArrowRight size={18}/></button></section>
      </>}

      {view === "chequeo" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">TU MOMENTO DE PAUSA</div><h1>¿Cómo te has <em>sentido últimamente?</em></h1><p>Un pequeño espacio para reconocer tu nivel de carga cotidiana. No hay respuestas buenas ni malas.</p></div>
        <div className="quiz-layout">
          <div className="quiz-panel">
            {!quizFinished ? <>
              <div className="quiz-top"><span>PREGUNTA {quizStep + 1} DE {questions.length}</span><span>{Math.round((quizStep / questions.length) * 100)}% completado</span></div>
              <div className="progress-track"><div style={{ width: String((quizStep / questions.length) * 100) + "%" }}/></div>
              <h2>{questions[quizStep]}</h2>
              <div className="answer-list">{responseOptions.map((option, index) => <button key={option} className={answers[quizStep] === index ? "answer-option selected" : "answer-option"} onClick={() => setAnswers((all) => all.map((a, i) => i === quizStep ? index : a))}><span className="radio-dot"/>{option}</button>)}</div>
              <div className="quiz-actions"><button className="button button-ghost" onClick={() => setQuizStep((s) => Math.max(s - 1, 0))} disabled={quizStep === 0}><ArrowLeft size={17}/> Anterior</button><button className="button button-primary" disabled={answers[quizStep] === -1} onClick={() => quizStep === questions.length - 1 ? setQuizFinished(true) : setQuizStep((s) => s + 1)}>{quizStep === questions.length - 1 ? "Ver mi reflexión" : "Continuar"} <ArrowRight size={17}/></button></div>
            </> : <div className="quiz-result"><span className="result-icon"><Leaf size={34}/></span><div className="eyebrow">TU REFLEXIÓN PERSONAL</div><h2>{category}</h2><p>{guidance}</p><div className="result-hint"><Info size={19}/><span>Este cuestionario es una actividad educativa creada para la demostración, sin validación psicométrica. No mide ni diagnostica burnout ni sustituye la evaluación profesional.</span></div><div className="result-buttons"><button className="button button-primary" onClick={() => navigate("profesionales")}>Explorar apoyo <ArrowRight size={17}/></button><button className="button button-outline" onClick={resetQuiz}>Volver a empezar</button></div></div>}
          </div>
          <aside className="quiz-aside"><span className="aside-illustration"><MoonStar size={56}/></span><h3>Un momento solo para ti.</h3><p>Tómate tu tiempo. Tus respuestas no se envían a ningún servidor ni se guardan en tu perfil.</p><div className="aside-divider"/><div className="aside-item"><LockKeyhole size={18}/> Sin crear una cuenta</div><div className="aside-item"><Clock3 size={18}/> Aproximadamente 2 minutos</div><div className="aside-item"><Heart size={18}/> Sin juicios ni etiquetas</div></aside>
        </div>
      </section>}

      {view === "profesionales" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">PERSONAS QUE ACOMPAÑAN</div><h1>Cada historia merece <em>ser escuchada.</em></h1><p>Explora diferentes enfoques del acompañamiento psicológico. Los perfiles y las reservas de esta sección son totalmente ficticios.</p></div>
        <div className="specialist-grid">{specialists.map((person) => <article className="specialist-card" key={person.id}><div className={"specialist-photo " + person.color}><div className="portrait-orbit"/><span>{person.initials}</span><div className="profile-label">PERFIL FICTICIO</div></div><div className="specialist-info"><div className="tag">Atención virtual · Demo</div><h3>{person.name}</h3><span className="role-name">{person.role}</span><p>{person.focus}</p><div className="specialist-bottom"><span><Clock3 size={15}/>{person.experience}</span></div><button className="button button-outline button-full" onClick={() => {setSelectedId(person.id); setBookingDate(""); setBookingHour(""); document.getElementById("booking-panel")?.scrollIntoView({ behavior: "smooth" });}}>Reservar cita de prueba <ArrowRight size={16}/></button></div></article>)}</div>
        <div className="booking-section" id="booking-panel"><div><div className="eyebrow">AGENDA UNA CITA DE DEMOSTRACIÓN</div><h2>Un primer paso, <em>cuando tú decidas.</em></h2><p>Experimenta cómo funcionaría el proceso de reserva. No se crearán citas reales y no es necesario ingresar datos personales.</p><div className="booking-person"><span className={"mini-avatar " + specialist.color}>{specialist.initials}</span><div><strong>{specialist.name}</strong><small>{specialist.role} · Perfil ficticio</small></div></div></div><div className="booking-form"><label htmlFor="professional">Profesional</label><select id="professional" value={selectedId} onChange={(e) => setSelectedId(Number(e.target.value))}>{specialists.map((person) => <option key={person.id} value={person.id}>{person.name} — {person.role}</option>)}</select><label htmlFor="date">Fecha de demostración</label><input id="date" type="date" value={bookingDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setBookingDate(e.target.value)}/><label htmlFor="hour">Horario de ejemplo</label><select id="hour" value={bookingHour} onChange={(e) => setBookingHour(e.target.value)}><option value="">Selecciona una hora</option>{slotOptions.map((slot) => <option key={slot}>{slot}</option>)}</select><button className="button button-primary button-full" onClick={saveBooking} disabled={!bookingDate || !bookingHour}>Confirmar reserva simulada <CalendarCheck2 size={18}/></button>{bookedNotice && <div className="success-message"><CheckCircle2 size={18}/> ¡Reserva de demostración creada! <button onClick={() => navigate("espacio")}>Ver en mi espacio</button></div>}</div></div>
      </section>}

      {view === "empresas" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">EQUILIBRAMIND PARA EMPRESAS</div><h1>El bienestar de tu equipo <em>también es parte del éxito.</em></h1><p>Una propuesta para promover la prevención del agotamiento laboral, la escucha y una cultura de cuidado dentro de las organizaciones.</p><button className="button button-primary" onClick={() => setCompanyPreview(!companyPreview)}>{companyPreview ? "Ocultar panel" : "Explorar panel de empresa"} <BarChart3 size={17}/></button></div>
        <div className="company-benefits"><div><UsersRound size={27}/><h3>Cultura de cuidado</h3><p>Recursos de psicoeducación para conversaciones más saludables.</p></div><div><Activity size={27}/><h3>Bienestar colectivo</h3><p>Indicadores de ejemplo para identificar tendencias de participación.</p></div><div><ShieldCheck size={27}/><h3>Privacidad por diseño</h3><p>Un enfoque de reportes agregados, sin respuestas clínicas individuales.</p></div></div>
        {companyPreview ? <div className="dashboard-preview"><div className="dashboard-header"><div><div className="eyebrow">PANEL EMPRESARIAL · SIMULACIÓN</div><h2>Resumen de bienestar</h2><span>Empresa ficticia: Horizonte Creativo S. A. S.</span></div><span className="demo-tag">DATOS SIMULADOS</span></div><div className="metric-grid"><div><span>Participación</span><strong>78%</strong><small>De colaboradores ficticios</small></div><div><span>Recursos explorados</span><strong>246</strong><small>Interacciones de ejemplo</small></div><div><span>Satisfacción estimada</span><strong>4,7/5</strong><small>Valor ficticio</small></div></div><div className="bar-visual"><h3>Interés por recursos de bienestar · Datos ficticios</h3>{[{l:"Gestión del estrés",w:83},{l:"Descanso y desconexión",w:65},{l:"Organización del tiempo",w:48}].map((item) => <div className="bar-item" key={item.l}><span>{item.l}</span><div><i style={{ width: String(item.w) + "%" }}/></div></div>)}</div><p className="dashboard-disclaimer"><Info size={16}/> Los indicadores no provienen de personas reales; ilustran un modelo de negocio potencial.</p></div> : <div className="company-callout"><span><BarChart3 size={40}/></span><div><h2>Una mirada humana a los datos.</h2><p>Abre el panel de demostración y descubre cómo podrían visualizarse indicadores agregados de un programa de bienestar.</p></div><button className="button button-dark" onClick={() => setCompanyPreview(true)}>Ver demostración <ArrowRight size={17}/></button></div>}
        <div className="company-bottom"><h2>Una propuesta a la medida <em>de cada equipo.</em></h2><p>Explora nuestro modelo corporativo ficticio y cómo podría evolucionar a un servicio contratado por organización.</p><button className="button button-outline" onClick={() => navigate("planes")}>Conocer planes <ArrowRight size={17}/></button></div>
      </section>}

      {view === "planes" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">PLANES PENSADOS PARA CADA NECESIDAD</div><h1>Elige cómo empezar <em>a cuidarte.</em></h1><p>Precios ilustrativos en pesos colombianos para validar el modelo de negocio. Sin transacciones ni cobros reales.</p></div>
        <div className="plan-grid">
          <article className="plan-card"><div className="plan-kicker">A TU RITMO</div><h3>Sesión individual</h3><p>Para quienes prefieren explorar el acompañamiento sin compromisos mensuales.</p><div className="price">$95.000 <small>COP / sesión · demo</small></div><div className="plan-divider"/><div className="plan-item"><Check size={17}/> Reserva virtual simulada</div><div className="plan-item"><Check size={17}/> Selección de profesional</div><div className="plan-item"><Check size={17}/> Recursos de bienestar</div><button className="button button-outline button-full" onClick={() => choosePlan("Sesión individual")}>Seleccionar plan demo <ArrowRight size={16}/></button></article>
          <article className="plan-card featured"><div className="recommended-label">MÁS COMPLETO · DEMO</div><div className="plan-kicker">ACOMPAÑAMIENTO CONSTANTE</div><h3>Equilibrio mensual</h3><p>Una propuesta de apoyo sostenido y hábitos saludables para el día a día.</p><div className="price">$279.000 <small>COP / mes · demo</small></div><div className="plan-divider"/><div className="plan-item"><Check size={17}/> Tres sesiones simuladas al mes</div><div className="plan-item"><Check size={17}/> Biblioteca de autocuidado</div><div className="plan-item"><Check size={17}/> Seguimiento orientativo</div><button className="button button-primary button-full" onClick={() => choosePlan("Equilibrio mensual")}>Seleccionar plan demo <ArrowRight size={16}/></button></article>
          <article className="plan-card"><div className="plan-kicker">BIENESTAR COLECTIVO</div><h3>Empresas</h3><p>Un modelo flexible para programas de bienestar y cultura organizacional.</p><div className="price price-custom">A medida <small>Propuesta comercial · demo</small></div><div className="plan-divider"/><div className="plan-item"><Check size={17}/> Talleres psicoeducativos</div><div className="plan-item"><Check size={17}/> Recursos para trabajadores</div><div className="plan-item"><Check size={17}/> Panel de indicadores agregados</div><button className="button button-outline button-full" onClick={() => navigate("empresas")}>Explorar empresas <ArrowRight size={16}/></button></article>
        </div><DemoNote />
      </section>}

      {view === "espacio" && <section className="inner-section section-width">
        <div className="subpage-head"><div className="eyebrow">UN ESPACIO PARA TI</div><h1>Bienvenida a <em>tu momento de calma.</em></h1><p>Un panel personal simulado para descubrir cómo se sentiría usar EquilibraMind cada día.</p></div>
        <div className="space-grid"><div className="space-main"><div className="greeting-card"><span className="tiny-label">PERFIL DE PRUEBA · VALENTINA</span><h2>Hoy también puedes darte un respiro.</h2><p>Los pequeños momentos de cuidado también cuentan.</p><span className="greeting-spark"><Sparkles size={43}/></span></div>
          <div className="space-card"><div className="space-title"><h3><CalendarDays size={21}/> Próxima cita</h3><span>DEMO</span></div>{booking ? <><div className="appointment-item"><span className="appointment-icon"><CalendarCheck2 size={25}/></span><div><strong>{booking.name}</strong><span>{booking.role}</span><small>{booking.date} · {booking.hour}</small></div></div><p className="muted-text">Confirmación ficticia guardada en este navegador. No existe videollamada ni atención agendada.</p><button className="text-link" onClick={() => navigate("profesionales")}>Modificar reserva demo <ArrowRight size={16}/></button></> : <><p className="muted-text">Todavía no tienes reservas en esta demostración.</p><button className="button button-outline" onClick={() => navigate("profesionales")}>Explorar profesionales <ArrowRight size={16}/></button></>}</div>
          {selectedPlan && <div className="space-card"><div className="space-title"><h3><CheckCircle2 size={21}/> Plan de ejemplo</h3><span>NO CONTRATADO</span></div><p>Seleccionaste <strong>{selectedPlan}</strong> para explorar el modelo comercial. No se ha realizado ningún pago ni suscripción.</p></div>}
        </div><aside className="space-side"><div className="space-card"><h3>Tu pausa de hoy <Leaf size={19}/></h3><p>¿Has respirado profundo hoy? Prueba inhalar suavemente, exhalar sin prisa y reconocer cómo te sientes.</p><div className="breathe-graphic"><span>inhala · exhala</span></div><small>Actividad de relajación general, no intervención clínica.</small></div><div className="space-card"><h3>Continúa explorando</h3><button className="shortcut" onClick={() => { resetQuiz(); navigate("chequeo"); }}><ClipboardCheck size={20}/> Chequeo orientativo <ArrowRight size={16}/></button><button className="shortcut" onClick={() => navigate("planes")}><HeartHandshake size={20}/> Planes de ejemplo <ArrowRight size={16}/></button></div></aside></div>
      </section>}
    </main>
    <DemoNote compact />
    <BrandFooter navigate={navigate} />
  </div>;
}
