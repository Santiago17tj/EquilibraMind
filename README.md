# EquilibraMind 🌿

**Tu bienestar también merece espacio.**

Prototipo académico y demostración de negocio de una plataforma de bienestar psicológico, psicoeducación y prevención del agotamiento laboral (*burnout*). Inspirado en el trabajo de Psicología Organizacional de la UDI (2026).

## Estado: versión 0.3 — experiencias por roles e imágenes IA

Proyecto web funcional de demostración, con diseño **wellbeing premium** (verde salvia, marfil, grafito) y contenido en español.

### Funcionalidades implementadas

- **Inicio comercial responsive:** propuesta de valor y recorrido de bienvenida.
- **Mi bienestar:** cuestionario orientativo de seis preguntas, con reflexión educativa y recomendaciones generales. **No es una prueba validada ni diagnóstico clínico.**
- **Profesionales:** tres perfiles completamente ficticios, con filtros por estrés laboral y vida estudiantil, fichas informativas ampliadas, enfoques y trayectorias simuladas. Los avatares son ilustrativos, no fotografías de profesionales reales.
- **Reservas ficticias:** flujo guiado para seleccionar profesional, **teleconsulta o presencial proyectada**, fecha y horario de ejemplo, con precio ilustrativo visible antes de confirmar. La reserva se guarda solo en el navegador y puede **modificarse o cancelarse** desde «Mi espacio». Se conserva únicamente una reserva de demostración a la vez.
- **Tarifas orientativas (solo demostración):** teleconsulta de 50 minutos $95.000 COP; presencial futura en Bucaramanga de 50 minutos $120.000 COP; tres teleconsultas mensuales $279.000 COP. No se realizan pagos.
- **Planes demostrativos:** pago por sesión, mensual y corporativo. **No hay cobros reales.**
- **Empresas:** propuesta B2B y panel con métricas agregadas simuladas.
- **Mi espacio:** vista personal de demostración, consulta de la reserva y ejercicios generales de respiración.
- **Tres vistas de demostración:** paciente, psicólogo y administrador. El selector es público y **no implementa autenticación ni permisos reales**.
- **Fotografías generadas con IA:** siete imágenes AVIF optimizadas para portada, perfiles, teleconsulta, empresas y bienestar estudiantil, claramente señaladas como ilustrativas o ficticias.
- **Modo seguro para presentar:** avisos permanentes sobre la naturaleza simulada de los contenidos.

## Tecnología y estructura

- [Next.js](https://nextjs.org/) (App Router), React, TypeScript y Lucide.
- CSS responsive sin dependencias visuales pesadas.
- Sin backend, credenciales, datos de pacientes ni cuentas reales.
- Base preparada para incorporar Supabase y autenticación en una fase posterior.

```text
app/
  layout.tsx      # Metadatos y estructura raíz
  page.tsx        # Sitio completo, estados y demo interactiva
  globals.css     # Diseño responsive
  icon.svg        # Favicon
  components/RoleDashboard.tsx  # Selector y paneles de tres roles
package.json      # Dependencias y scripts
tsconfig.json     # TypeScript
netlify.toml      # Configuración de build
public/images/   # 7 fotografías AVIF generadas con IA
```

## Ejecutar en local

Requisitos: Node.js 22 o posterior, npm.

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

Comprobar compilación:

```bash
npm run build
```

## Desplegar en Netlify

1. Ingresar en [Netlify](https://app.netlify.com/).
2. Elegir **Add new project → Import an existing project**.
3. Seleccionar GitHub y el repositorio **Santiago17tj/EquilibraMind**.
4. Rama de publicación: `main`.
5. Framework: Next.js. Directorio base: raíz del repositorio.
6. Comando de compilación: `npm run build`. Carpeta de publicación: `.next` (definida en `netlify.toml`).
7. **Deploy**. No necesitas variables de entorno para esta versión.

Netlify usa automáticamente su adaptador de Next.js. **No** agregar una redirección SPA de `/*` a `index.html`.

## Desplegar en Vercel

Importar el repositorio desde Vercel y dejar la configuración detectada de Next.js. No se necesitan variables de entorno.

## Guion para mostrar la experiencia

1. Abrir Inicio y explicar la propuesta de valor.
2. Pulsar **Conoce cómo te sientes** para completar el chequeo orientativo.
3. Ir a **Profesionales** y seleccionar un perfil ficticio.
4. Utilizar los filtros «Estrés laboral» o «Vida estudiantil» y abrir «Ver perfil» para mostrar una ficha ampliada.
5. Pulsar «Agendar demo» y elegir entre teleconsulta o presencial futura; revisar el precio antes de continuar.
6. Elegir fecha y hora de ejemplo y confirmar una reserva simulada.
7. Abrir **Mi espacio** y comprobar que la reserva se conserva al recargar ese navegador.
8. Pulsar «Cambiar cita demo», revisar que se recuperen los datos y confirmar una nueva fecha.
9. Pulsar «Cancelar reserva demo» y comprobar que desaparezca del panel (puedes volver a crearla).
10. Ir a **Para empresas** y abrir el panel de métricas ficticias.
11. Entrar a **Probar roles** y alternar entre Paciente, Psicólogo y Administrador. Aclarar que el selector no autentica usuarios y que las métricas son ejemplos.
12. En **Planes**, explicar el modelo de pago por sesión, suscripción y B2B.

## Privacidad, ética y límites

Este es un **prototipo**, no un prestador habilitado de servicios de salud. **Las fotografías de profesionales representan personajes generados con inteligencia artificial; ninguna persona ilustrada es un profesional contratado o verificado. El selector de roles es público y no restringe acceso.** **No** ingresar nombres reales de pacientes, historias clínicas ni datos personales sensibles. Los profesionales, sus trayectorias, citas, precios, disponibilidad y métricas son ficticios. Las respuestas del cuestionario se procesan en memoria y no se guardan en el navegador ni se envían a un servidor. Solo una reserva **ficticia** puede almacenarse localmente para facilitar la presentación.

Para convertirlo en un servicio comercial real en Colombia: validar habilitación profesional y del prestador, reglas de telesalud, consentimiento informado, privacidad, cifrado, respuesta a crisis, auditoría, pagos y derechos de acceso.

## Siguiente fase

- **0.4:** separar el monolito en componentes reutilizables, mejorar accesibilidad, persistencia local de escenarios y experiencia de demostración guiada; después incorporar autenticación segura real con controles de roles verificados.
- **Fase comercial futura:** profesionales habilitados, autenticación segura y datos protegidos (Supabase), disponibilidad y cancelaciones reales, cobros integrados, y protocolos clínicos y empresariales bajo asesoría especializada.

> No publicar secretos ni credenciales en este repositorio público.
