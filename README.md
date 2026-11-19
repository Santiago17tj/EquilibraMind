# EquilibraMind 🌿

**Tu bienestar también merece espacio.**

Prototipo académico y demostración de negocio de una plataforma de bienestar psicológico, psicoeducación y prevención del agotamiento laboral (*burnout*). Inspirado en el trabajo de Psicología Organizacional de la UDI (2026).

## Estado: versión 0.1

Proyecto web funcional de demostración, con diseño **wellbeing premium** (verde salvia, marfil, grafito) y contenido en español.

### Funcionalidades implementadas

- **Inicio comercial responsive:** propuesta de valor y recorrido de bienvenida.
- **Mi bienestar:** cuestionario orientativo de seis preguntas, con reflexión educativa y recomendaciones generales. **No es una prueba validada ni diagnóstico clínico.**
- **Profesionales:** tres perfiles completamente ficticios, con énfasis en psicología clínica, estudiantil y organizacional.
- **Reservas ficticias:** selección de profesional, fecha y hora. Confirmación simulada guardada únicamente en el almacenamiento local del navegador.
- **Planes demostrativos:** pago por sesión, mensual y corporativo. **No hay cobros reales.**
- **Empresas:** propuesta B2B y panel con métricas agregadas simuladas.
- **Mi espacio:** vista personal de demostración, consulta de la reserva y ejercicios generales de respiración.
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
package.json      # Dependencias y scripts
tsconfig.json     # TypeScript
netlify.toml      # Configuración de build
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
4. Elegir fecha y hora de ejemplo, confirmar reserva simulada.
5. Abrir **Mi espacio** y comprobar que la reserva se conserva al recargar ese navegador.
6. Ir a **Para empresas** y abrir el panel de métricas ficticias.
7. En **Planes**, explicar el modelo de pago por sesión, suscripción y B2B.

## Privacidad, ética y límites

Este es un **prototipo**, no un prestador habilitado de servicios de salud. **No** ingresar nombres reales de pacientes, historias clínicas ni datos personales sensibles. Los profesionales, sus trayectorias, citas, precios, disponibilidad y métricas son ficticios. Las respuestas del cuestionario se procesan en memoria y no se guardan en el navegador ni se envían a un servidor. Solo una reserva **ficticia** puede almacenarse localmente para facilitar la presentación.

Para convertirlo en un servicio comercial real en Colombia: validar habilitación profesional y del prestador, reglas de telesalud, consentimiento informado, privacidad, cifrado, respuesta a crisis, auditoría, pagos y derechos de acceso.

## Siguiente fase

- **0.2:** estructura por módulos/rutas, accesibilidad reforzada, autenticación real y datos seguros (Supabase).
- **0.3:** calendario real con disponibilidad, plataforma empresarial con datos agregados, pagos integrados y flujos profesionales bajo supervisión clínica.

> No publicar secretos ni credenciales en este repositorio público.
