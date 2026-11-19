"use client";

import { useState } from "react";
import { CalendarCheck2, CalendarClock, Check, ChevronRight, ClipboardList, CreditCard, HeartHandshake, LayoutDashboard, ShieldCheck, Stethoscope, UserRound, Users, XCircle } from "lucide-react";

export type DemoRole = "paciente" | "psicologo" | "administrador";
export type DemoBooking = { name: string; role: string; date: string; hour: string; mode?: "virtual" | "presencial"; price?: number };

type Props = {
  booking: DemoBooking | null;
  selectedRole: DemoRole;
  setSelectedRole: (role: DemoRole) => void;
  onViewBooking: () => void;
  onChooseProfessional: () => void;
};
const formatCOP = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const roleItems: { id: DemoRole; name: string; description: string; icon: typeof UserRound }[] = [
  { id: "paciente", name: "Paciente", description: "Explora tu bienestar y tus reservas", icon: UserRound },
  { id: "psicologo", name: "Psicólogo", description: "Agenda y jornada profesional ficticia", icon: Stethoscope },
  { id: "administrador", name: "Administrador", description: "Operación e indicadores del negocio", icon: LayoutDashboard }
];
const mockAppointments = [
  { time: "9:00 a. m.", initials: "VC", person: "Valentina C.", kind: "Teleconsulta", status: "De ejemplo" },
  { time: "11:30 a. m.", initials: "MA", person: "Mateo A.", kind: "Teleconsulta", status: "De ejemplo" },
  { time: "3:00 p. m.", initials: "CR", person: "Camila R.", kind: "Presencial futura", status: "De ejemplo" }
];
export function RoleDashboard({ booking, selectedRole, setSelectedRole, onViewBooking, onChooseProfessional }: Props) {
  const [simNotice, setSimNotice] = useState("");
  const current = roleItems.find(item => item.id === selectedRole) ?? roleItems[0];
  return <section className="role-demo-wrap" aria-label="Experiencias de demostración por rol">
    <div className="role-demo-header">
      <div><span className="eyebrow">PLATAFORMA MULTIPERFIL · DEMO</span><h2>Explora EquilibraMind desde distintos roles.</h2><p>Cambia entre tres experiencias sin introducir datos personales. Son vistas públicas de demostración: no constituyen un inicio de sesión ni ofrecen acceso real a información de pacientes.</p></div>
      <span className="demo-tag">DATOS FICTICIOS</span>
    </div>
    <div className="role-selection" role="group" aria-label="Selecciona el rol de demostración">
      {roleItems.map(({ id, name, description, icon: Icon }) => <button key={id} type="button" aria-pressed={id === selectedRole} onClick={() => {setSelectedRole(id); setSimNotice("");}} className={"role-selector " + (selectedRole === id ? "current" : "")}><span className="role-selector-icon"><Icon size={23}/></span><strong>{name}</strong><small>{description}</small><ChevronRight size={16} className="role-chevron"/></button>)}
    </div>
    <div className="role-dashboard" key={selectedRole}>
      <div className="role-dashboard-top"><div><span className="eyebrow">VISTA: {current.name.toUpperCase()}</span><h3>{selectedRole === "paciente" ? "Mi bienestar, a mi ritmo." : selectedRole === "psicologo" ? "Tu jornada de acompañamiento." : "La operación de un negocio con propósito."}</h3></div><span className="role-dashboard-mode"><ShieldCheck size={15}/> Demostración sin autenticación</span></div>
      {selectedRole === "paciente" && <>
        <div className="role-stat-grid">
          <div className="role-stat"><HeartHandshake size={22}/><span>Mi objetivo de hoy</span><strong>Hacer una pausa</strong><small>Recordatorio educativo ficticio</small></div>
          <div className="role-stat"><CalendarCheck2 size={22}/><span>Mis citas de ejemplo</span><strong>{booking ? "1 reserva" : "Sin reservas"}</strong><small>Solo visibles en este navegador</small></div>
          <div className="role-stat"><ClipboardList size={22}/><span>Contenido sugerido</span><strong>3 recursos</strong><small>Sin diagnóstico ni historial clínico</small></div>
        </div>
        <div className="role-detail-panels"><div className="role-panel"><h4>Mi próxima sesión ficticia</h4>{booking ? <p>{booking.name} · {booking.date} · {booking.hour} · {booking.mode === "presencial" ? "Presencial proyectada" : "Teleconsulta de prueba"}</p> : <p>En esta demo todavía no has reservado. Explora un profesional y prueba la experiencia.</p>}<button className="text-link" onClick={booking ? onViewBooking : onChooseProfessional}>{booking ? "Gestionar reserva" : "Explorar especialistas"} <ChevronRight size={16}/></button></div><div className="role-panel"><h4>Pequeños hábitos</h4><p>Respira sin prisa, reconoce tus necesidades y reserva espacios de descanso durante el día.</p><span className="role-small-note">Consejos generales, no intervención psicológica.</span></div></div>
      </>}
      {selectedRole === "psicologo" && <>
        <div className="role-stat-grid"><div className="role-stat"><CalendarClock size={22}/><span>Sesiones programadas</span><strong>3</strong><small>Agenda inventada para exposición</small></div><div className="role-stat"><Users size={22}/><span>Usuarios ilustrativos</span><strong>12</strong><small>Personajes ficticios</small></div><div className="role-stat"><Stethoscope size={22}/><span>Modalidad</span><strong>Virtual / futura</strong><small>Sin teleconsultas en vivo</small></div></div>
        <div className="role-panel role-table-panel"><h4>Agenda de ejemplo · Laura Méndez</h4><div className="role-appointment-list">{mockAppointments.map(item => <div key={item.time} className="role-appointment"><span className="role-initials">{item.initials}</span><span><strong>{item.person}</strong><small>{item.kind} · {item.status}</small></span><time>{item.time}</time></div>)}</div><button className="button button-outline" onClick={() => setSimNotice("Acción simulada: en una versión comercial, aquí el profesional gestionaría su disponibilidad y sus sesiones mediante acceso autorizado.")}>Gestionar disponibilidad (demo)</button></div>
      </>}
      {selectedRole === "administrador" && <>
        <div className="role-stat-grid"><div className="role-stat"><Users size={22}/><span>Usuarios registrados</span><strong>128</strong><small>Cifra comercial ficticia</small></div><div className="role-stat"><CalendarCheck2 size={22}/><span>Reservas del mes</span><strong>46</strong><small>Cifra comercial ficticia</small></div><div className="role-stat"><CreditCard size={22}/><span>Ingresos ilustrativos</span><strong>{formatCOP(4370000)}</strong><small>No representa dinero recibido</small></div></div>
        <div className="role-detail-panels"><div className="role-panel"><h4>Servicios más explorados</h4><div className="role-metric-line"><span>Teleconsulta</span><b>64%</b></div><div className="role-meter"><i style={{width:"64%"}}/></div><div className="role-metric-line"><span>Bienestar corporativo</span><b>36%</b></div><div className="role-meter"><i style={{width:"36%"}}/></div></div><div className="role-panel"><h4>Control operacional futuro</h4><p>Un panel comercial podría administrar profesionales habilitados, planes, calendario y métricas empresariales agregadas, con permisos y trazabilidad.</p><button className="button button-outline" onClick={() => setSimNotice("Acción simulada: la administración real requerirá autenticación, permisos y una base de datos segura.")}>Explorar gestión (demo)</button></div></div>
      </>}
      {simNotice && <p className="role-action-notice" role="status"><Check size={16}/>{simNotice}<button aria-label="Cerrar aviso" onClick={() => setSimNotice("")}><XCircle size={16}/></button></p>}
    </div>
  </section>;
}
