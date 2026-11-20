import { BarChart3, HeartHandshake, MessagesSquare } from "lucide-react";

const stages = [
  {
    number: "01",
    title: "Comprender el contexto",
    description: "Identificar necesidades generales del equipo y definir los objetivos de un programa de bienestar.",
    icon: MessagesSquare
  },
  {
    number: "02",
    title: "Activar espacios de cuidado",
    description: "Proponer talleres psicoeducativos, pausas conscientes y recursos accesibles para el día a día.",
    icon: HeartHandshake
  },
  {
    number: "03",
    title: "Revisar la participación",
    description: "Explorar cómo se presentarían indicadores agregados y oportunidades de mejora, sin datos clínicos individuales.",
    icon: BarChart3
  }
];

export function CompanyJourney() {
  return (
    <section className="company-journey" aria-labelledby="company-journey-title">
      <div className="company-journey-heading">
        <span className="eyebrow">UNA PROPUESTA QUE SE PUEDE EXPLICAR</span>
        <h2 id="company-journey-title">Del interés por el bienestar <em>a un plan comprensible.</em></h2>
        <p>Este sería el camino para explorar un programa de bienestar organizacional. Cada etapa es ilustrativa: no representa un servicio actualmente contratado ni una implementación real.</p>
      </div>
      <ol className="company-journey-steps">
        {stages.map(({ number, title, description, icon: Icon }) => (
          <li key={number}>
            <div className="company-journey-top">
              <span className="company-journey-number" aria-hidden="true">{number}</span>
              <span className="company-journey-icon"><Icon size={23} aria-hidden="true"/></span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </li>
        ))}
      </ol>
      <p className="company-journey-disclaimer">Modelo académico. La medición y las cifras mostradas en el panel son ficticias; no se recopilan datos de empleados reales.</p>
    </section>
  );
}
