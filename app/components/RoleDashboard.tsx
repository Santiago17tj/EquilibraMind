"use client";

import { useState } from "react";
import {
  CalendarCheck2, CalendarClock, Check, ChevronRight, ClipboardList, CreditCard,
  HeartHandshake, LayoutDashboard, RotateCcw, ShieldCheck, Stethoscope, UserRound, Users, XCircle
} from "lucide-react";
import { type DemoRole, type DemoAppointment, type DemoSnapshot } from "../lib/demo-db";

type Props = {
  snapshot: DemoSnapshot | null;
  booking: DemoAppointment | null;
  selectedRole: DemoRole;
  setSelectedRole: (role: DemoRole) => void;
  currentPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onReset: () => void;
  onViewBooking: () => void;
  onChooseProfessional: () => void;
};

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const formatDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" }).format(new Date(y, m - 1, d));
};
const roleItems: { id: DemoRole; name: string; description: string; icon: typeof UserRound }[] = [
  { id: "paciente", name: "Paciente", description: "Explora tu bienestar y las reservas", icon: UserRound },
  { id: "psicologo", name: "Psicólogo", description: "Conoce la agenda del profesional", icon: Stethoscope },
  { id: "administrador", name: "Administrador", description: "Explora la operación del negocio", icon: LayoutDashboard }
];

export function RoleDashboard({
  snapshot, booking, selectedRole, setSelectedRole, currentPatientId, onSelectPatient,
  onReset, onViewBooking, onChooseProfessional
}: Props) {
  const [notice, setNotice] = useState("");
  const [professionalId, setProfessionalId] = useState(1);
  const patients = snapshot?.patients ?? [];
  const professionals = snapshot?.professionals ?? [];
  const allAppointments = snapshot?.appointments ?? [];
  const appointments = allAppointments.filter(item => item.status === "scheduled");
  const currentRole = roleItems.find(item => item.id === selectedRole) ?? roleItems[0];
  const professional = professionals.find(item => item.id === professionalId) ?? professionals[0];
  const professionalAppointments = appointments
    .filter(item => item.professionalId === professional?.id)
    .sort((a, b) => (a.date + a.hour).localeCompare(b.date + b.hour));
  const patient = patients.find(item => item.id === currentPatientId);
  const totalRevenue = appointments.reduce((sum, item) => sum + item.price, 0);
  const virtualCount = appointments.filter(item => item.mode === "virtual").length;
  const virtualPercent = appointments.length ? Math.round(virtualCount * 100 / appointments.length) : 0;

  return <section className="role-demo-wrap" aria-label="Paneles interactivos de demostración">
    <div className="role-demo-header">
      <div>
        <span className="eyebrow">EXPERIENCIAS POR ROL · BASE LOCAL</span>
        <h2>Una plataforma, <em>tres experiencias.</em></h2>
        <p>Cambia de rol, prueba las citas y revisa cómo los datos se reflejan en las diferentes vistas. Todo es ficticio y se guarda exclusivamente en este navegador.</p>
      </div>
      <span className="demo-tag">DATOS FICTICIOS</span>
    </div>
    <div className="role-selection" role="group" aria-label="Elegir vista de demostración">
      {roleItems.map(({ id, name, description, icon: Icon }) =>
        <button key={id} type="button" aria-pressed={id === selectedRole}
          onClick={() => { setSelectedRole(id); setNotice(""); }}
          className={"role-selector " + (selectedRole === id ? "current" : "")}>
          <span className="role-selector-icon"><Icon size={23} /></span>
          <strong>{name}</strong><small>{description}</small>
          <ChevronRight size={16} className="role-chevron" />
        </button>)}
    </div>
    <div className="role-dashboard" key={selectedRole}>
      <div className="role-dashboard-top">
        <div><span className="eyebrow">VISTA DE {currentRole.name.toUpperCase()}</span>
          <h3>{selectedRole === "paciente" ? "Tu bienestar, a tu ritmo." : selectedRole === "psicologo" ? "Una agenda para acompañar." : "Bienestar con visión de negocio."}</h3></div>
        <span className="role-dashboard-mode"><ShieldCheck size={15} /> Sin cuentas ni permisos reales</span>
      </div>

      {!snapshot && <div className="role-panel"><h4>Sin datos locales</h4><p>La demo necesita acceso al almacenamiento del navegador. No requiere conexión a una base de datos externa.</p></div>}

      {snapshot && selectedRole === "paciente" && <>
        <label className="local-field-label" htmlFor="demo-patient">Selecciona un personaje de prueba</label>
        <select className="local-picker" id="demo-patient" value={currentPatientId}
          onChange={event => onSelectPatient(event.target.value)}>
          {patients.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <div className="role-stat-grid">
          <div className="role-stat"><HeartHandshake size={22}/><span>Perfil</span><strong>{patient?.name.split(" ")[0] ?? "—"}</strong><small>Personaje ficticio</small></div>
          <div className="role-stat"><CalendarCheck2 size={22}/><span>Mis reservas</span><strong>{booking ? "1 activa" : "Ninguna"}</strong><small>Persistencia en IndexedDB</small></div>
          <div className="role-stat"><ClipboardList size={22}/><span>Recursos</span><strong>3 temas</strong><small>Contenido educativo</small></div>
        </div>
        <div className="role-detail-panels">
          <div className="role-panel"><h4>Próxima cita ficticia</h4>
            {booking ? <p>{booking.name} · {formatDate(booking.date)} · {booking.hour} · {booking.mode === "virtual" ? "Teleconsulta" : "Presencial futura"}</p>
              : <p>Este personaje todavía no tiene una reserva activa. Puedes simular una ahora.</p>}
            <button className="text-link" onClick={booking ? onViewBooking : onChooseProfessional}>
              {booking ? "Modificar o cancelar" : "Elegir profesional"} <ChevronRight size={16}/>
            </button>
          </div>
          <div className="role-panel"><h4>Pequeños hábitos</h4>
            <p>Descansar también es avanzar. Descubre ejercicios sencillos para reconocer cómo te sientes y crear momentos de calma.</p>
            <span className="role-small-note">No sustituye apoyo clínico.</span>
          </div>
        </div>
      </>}

      {snapshot && selectedRole === "psicologo" && <>
        <label className="local-field-label" htmlFor="demo-professional">Selecciona un profesional ficticio</label>
        <select className="local-picker" id="demo-professional" value={professionalId}
          onChange={event => setProfessionalId(Number(event.target.value))}>
          {professionals.map(item => <option key={item.id} value={item.id}>{item.name} · {item.role}</option>)}
        </select>
        <div className="role-stat-grid">
          <div className="role-stat"><CalendarClock size={22}/><span>Reservas activas</span><strong>{professionalAppointments.length}</strong><small>En este navegador</small></div>
          <div className="role-stat"><Users size={22}/><span>Pacientes ficticios</span><strong>{new Set(professionalAppointments.map(item => item.patientId)).size}</strong><small>Sin información clínica</small></div>
          <div className="role-stat"><Stethoscope size={22}/><span>Especialidad</span><strong>{professional?.name.split(" ")[0] ?? "—"}</strong><small>{professional?.role ?? "Sin seleccionar"}</small></div>
        </div>
        <div className="role-panel role-table-panel">
          <h4>Agenda · {professional?.name ?? "Profesional"}</h4>
          <div className="role-appointment-list">
            {professionalAppointments.length === 0 && <p>No hay sesiones activas de ejemplo para este perfil.</p>}
            {professionalAppointments.map(item => {
              const person = patients.find(p => p.id === item.patientId);
              return <div key={item.id} className="role-appointment">
                <span className="role-initials">{person?.name.split(" ").map(word => word[0]).join("") ?? "DE"}</span>
                <span><strong>{person?.name ?? "Personaje ficticio"}</strong>
                  <small>{formatDate(item.date)} · {item.mode === "virtual" ? "Teleconsulta" : "Presencial futura"}</small></span>
                <time>{item.hour}</time>
              </div>;
            })}
          </div>
          <button className="button button-outline" onClick={() => setNotice("La gestión de disponibilidad profesional real se incorporaría solo con autenticación, permisos y una agenda verificada.")}>
            Gestionar horarios (simulación)
          </button>
        </div>
      </>}

      {snapshot && selectedRole === "administrador" && <>
        <div className="role-stat-grid">
          <div className="role-stat"><Users size={22}/><span>Pacientes ficticios</span><strong>{patients.length}</strong><small>Registros locales de prueba</small></div>
          <div className="role-stat"><CalendarCheck2 size={22}/><span>Reservas activas</span><strong>{appointments.length}</strong><small>{allAppointments.filter(a => a.status === "cancelled").length} canceladas de prueba</small></div>
          <div className="role-stat"><CreditCard size={22}/><span>Valor de reservas</span><strong>{formatCOP(totalRevenue)}</strong><small>No representa ingresos cobrados</small></div>
        </div>
        <div className="role-detail-panels">
          <div className="role-panel">
            <h4>Distribución de modalidades</h4>
            <div className="role-metric-line"><span>Teleconsulta simulada</span><b>{virtualPercent}%</b></div>
            <div className="role-meter"><i style={{width: virtualPercent + "%"}} /></div>
            <div className="role-metric-line"><span>Presencial proyectada</span><b>{100 - virtualPercent}%</b></div>
            <div className="role-meter"><i style={{width: (100 - virtualPercent) + "%"}} /></div>
            <span className="role-small-note">Porcentajes calculados con citas ficticias de este navegador.</span>
          </div>
          <div className="role-panel">
            <h4>Operación del prototipo</h4>
            <p>{professionals.length} profesionales simulados, {snapshot.plans.length} planes y {appointments.length} reservas activas. Los cambios aparecen inmediatamente en todos los paneles.</p>
            <button className="button button-outline" onClick={() => setNotice("La facturación, los permisos y los datos de pacientes reales requieren un backend seguro. Este panel es solo una demostración local.")}>
              Conocer los límites del demo
            </button>
          </div>
        </div>
      </>}

      {notice && <p className="role-action-notice" role="status"><Check size={16}/>{notice}
        <button aria-label="Cerrar aviso" onClick={() => setNotice("")}><XCircle size={16}/></button></p>}
    </div>
    <div className="local-demo-footer">
      <p><ShieldCheck size={18}/> La información permanece en este navegador. No se utilizan contraseñas, datos clínicos ni pagos reales.</p>
      <button type="button" className="button button-outline" onClick={onReset}><RotateCcw size={16}/> Restablecer datos de la demo</button>
    </div>
  </section>;
}
