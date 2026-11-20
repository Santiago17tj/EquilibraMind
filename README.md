# EquilibraMind 🌿

**Tu bienestar también merece espacio.**

Prototipo académico y demostración de negocio de una plataforma de bienestar psicológico, psicoeducación y prevención del agotamiento laboral (*burnout*). Inspirado en el trabajo de Psicología Organizacional de la UDI (2026).

## Estado: versión 0.7 — diseño responsive y propuesta B2B

La v0.7 se integró en `main` mediante el PR #2. Incluye una composición adaptable del cuestionario, tarjetas a tamaño tableta, la nueva presentación empresarial de tres etapas, el texto de fecha en español, correcciones de accesibilidad y pruebas E2E adicionales. Toda la información sobre servicios, métricas y profesionales sigue siendo **ficticia**.

## Versión 0.7.1 — bienvenida animada y microinteracciones (publicada)

La versión 0.7.1 se integró en `main` mediante el [PR #3](https://github.com/Santiago17tj/EquilibraMind/pull/3), con un ajuste posterior del ejercicio de respiración en el [PR #4](https://github.com/Santiago17tj/EquilibraMind/pull/4). Se mantiene el carácter **académico y ficticio** del prototipo.

- Intro breve al abrir una pestaña: marca EquilibraMind, anillos de respiración y mensaje «A veces, todo empieza con una pausa».
- Cierre automático o botón «Entrar ahora». Escape y cualquier interacción con navegación ocultan la intro inmediatamente.
- Una visita por pestaña con `sessionStorage`; al recargar no reaparece.
- Compatibilidad con `prefers-reduced-motion: reduce` y navegación sin bloqueo.
- Microinteracciones discretas en tarjetas, filtros, botones y cuestionario.
- Corrección del temporizador para que la pausa y el reinicio no procesen intervalos pendientes.
- Pruebas Playwright ampliadas. La última ejecución de la rama de corrección pasó **69/69** casos E2E, además de TypeScript, build y pruebas unitarias.

Ver [docs/REVISION_MOTION_V071.md](docs/REVISION_MOTION_V071.md) para los criterios usados durante el desarrollo. Las validaciones de accesibilidad y dispositivos reales siguen siendo tareas de calidad pendientes.

## Estado: versión 0.6 — calidad, retratos diferenciados y reserva más intuitiva

Proyecto web funcional de demostración, con diseño **wellbeing premium** (verde salvia, marfil, grafito) y contenido en español.

### Funcionalidades implementadas

- **Inicio comercial responsive:** propuesta de valor y recorrido de bienvenida.
- **Mi bienestar:** cuestionario orientativo de seis preguntas, con reflexión educativa y recomendaciones generales. **No es una prueba validada ni diagnóstico clínico.**
- **Profesionales:** tres perfiles completamente ficticios, con filtros por estrés laboral y vida estudiantil, fichas ampliadas y retratos sintéticos claramente diferenciados. La fotografía de Daniela usa dos archivos nuevos para evitar imágenes antiguas del caché.
- **Reservas ficticias:** flujo guiado para elegir profesional, personaje de paciente, **teleconsulta o presencial proyectada**, fecha, horario y precio. Las reservas se guardan en **IndexedDB**, se pueden modificar o cancelar y sus cambios aparecen en las vistas de paciente, psicólogo y administrador. La selección ahora marca los horarios ficticios ocupados y limpia la hora al cambiar día o profesional. Cada personaje puede tener una cita activa a la vez.
- **Tarifas orientativas (solo demostración):** teleconsulta de 50 minutos $95.000 COP; presencial futura en Bucaramanga de 50 minutos $120.000 COP; tres teleconsultas mensuales $279.000 COP. No se realizan pagos.
- **Planes demostrativos:** pago por sesión, mensual y corporativo. **No hay cobros reales.**
- **Empresas:** propuesta B2B y panel con métricas agregadas simuladas.
- **Mi espacio:** vista personal de demostración, consulta de la reserva y ejercicios generales de respiración.
- **Tres vistas conectadas a los mismos datos locales:** paciente (cambiar entre tres personajes), psicólogo (agenda por profesional) y administrador (indicadores calculados con reservas ficticias). Selector público **sin autenticación ni permisos reales**.
- **Fotografías generadas con IA:** siete imágenes AVIF optimizadas utilizadas en la web, incluyendo dos retratos nuevos e independientes (`laura-v06.avif` y `daniela-v06.avif`) con personas claramente diferenciadas. Todos los perfiles siguen identificados como personajes ficticios.
- **Ejercicio de respiración interactivo:** una pausa de un minuto con control de inicio, pausa y reinicio; movimientos discretos y respeto por movimiento reducido.
- **Recorrido guiado dual:** guía de seis pasos para personas y cinco pasos para empresas, con navegación real entre el chequeo, perfiles, reservas, planes y paneles, sin automatizar decisiones ni pagos.
- **Accesibilidad y móvil:** menú que se cierra con Escape, salto al contenido con teclado, barra de accesos rápidos en celular, encabezado visible, estados y controles accesibles y transiciones suaves.
- **Flujo del chequeo a servicios:** resultados educativos con accesos directos a profesionales y tarifas.
- **Verificación integrada:** desde **Probar roles → Verificar demo en este navegador** puede comprobarse de forma no destructiva la base IndexedDB, las relaciones entre registros y la resolución y diferencia de contenido entre los retratos.
- **Restablecer demo:** un botón repone pacientes, citas, planes y preferencias ficticios en el navegador antes de cada exposición.
- **Modo seguro para presentar:** avisos permanentes sobre la naturaleza simulada de los contenidos.

## Tecnología y estructura

- [Next.js](https://nextjs.org/) (App Router), React, TypeScript y Lucide.
- CSS responsive, animaciones de entrada y microinteracciones; preferencia de movimiento reducido respetada.
- **IndexedDB**, base de datos local del navegador (sin servidor ni Supabase). Los datos de una persona no se sincronizan con otros celulares o computadores.
- Solo hay personajes y citas ficticias: no es una base de datos apta para información clínica, no ofrece autenticación y no tiene pagos reales.

```text
app/
  layout.tsx      # Metadatos y estructura raíz
  page.tsx        # Sitio completo, estados y demo interactiva
  globals.css     # Diseño responsive
  icon.svg        # Favicon
  components/RoleDashboard.tsx  # Paneles con datos de IndexedDB
  components/BreathingExercise.tsx  # Pausa guiada de un minuto
  components/GuidedExperience.tsx  # Recorridos públicos para personas y empresas
  components/DemoDiagnostics.tsx  # Comprobación local y de imágenes
  lib/demo-db.ts  # Esquema y operaciones locales IndexedDB
package.json      # Dependencias y scripts
tsconfig.json     # TypeScript
next.config.ts    # Raíz de build para Turbopack
playwright.config.ts  # Configuración de pruebas E2E
netlify.toml      # Configuración de build
public/images/   # 7 fotografías AVIF generadas con IA
e2e/             # 59 pruebas E2E en Chromium
tests/unit/      # Pruebas de invariantes de datos
docs/GUIA_EXPOSICION.md  # Guion de presentación y pruebas de aceptación
docs/PRUEBAS_V06.md  # Matriz y límites de pruebas v0.6
docs/QA_V06_RESULTADOS.md  # Informe de la auditoría automatizada
docs/capturas/   # Capturas responsive 375 / 768 / 1440 px
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

## Pruebas automatizadas (QA v0.6)

La suite usa Playwright con Chromium y levanta el build de producción en el puerto 3100. La primera vez:

```bash
npx playwright install chromium
```

Comandos:

```bash
npm run typecheck   # TypeScript sin emitir
npm run test:unit   # invariantes de los datos ficticios
npm run test:e2e    # 59 pruebas E2E en Chromium
```

Cobertura: navegación y menús, cuestionario, recorridos guiados, retratos, reservas (horarios ocupados, reprogramación y cancelación), persistencia en IndexedDB, coherencia entre roles, restablecimiento, respiración, accesibilidad básica y capturas responsive a 375, 768 y 1440 px. Cada prueba usa un contexto de navegador aislado y no comparte IndexedDB con las demás.

GitHub Actions (`.github/workflows/qa.yml`) ejecuta TypeScript, las pruebas unitarias, el build y Playwright en cada pull request hacia `main`. El reporte de Playwright queda como artefacto de la ejecución.

Las capturas quedan en `docs/capturas/`; el reporte HTML en `playwright-report/` y el JSON en `test-results/`. El informe completo está en [docs/QA_V06_RESULTADOS.md](docs/QA_V06_RESULTADOS.md).

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

Guía detallada, recorridos personal y empresarial y lista de verificación: [docs/GUIA_EXPOSICION.md](docs/GUIA_EXPOSICION.md).

Puedes iniciar el recorrido personal en **Inicio → Descubre cómo funciona, paso a paso** o pulsar **Ver recorrido** en la cabecera. El recorrido B2B inicia desde **Para empresas → Presentar propuesta B2B**.

1. Abrir Inicio y explicar la propuesta de valor.
2. Pulsar **Conoce cómo te sientes** para completar el chequeo orientativo.
3. Ir a **Profesionales** y seleccionar un perfil ficticio.
4. Utilizar los filtros «Estrés laboral» o «Vida estudiantil» y abrir «Ver perfil» para mostrar una ficha ampliada.
5. Pulsar «Agendar demo» y elegir entre teleconsulta o presencial futura; revisar el precio antes de continuar.
6. Elegir personaje, fecha y hora de ejemplo, confirmar una reserva y comprobar el resultado.
7. Abrir **Mi espacio** y comprobar que la reserva se conserva al recargar ese navegador.
8. Pulsar «Cambiar cita demo», revisar que se recuperen los datos y confirmar una nueva fecha.
9. Pulsar «Cancelar reserva demo» y comprobar que desaparezca del panel (puedes volver a crearla).
10. Ir a **Para empresas** y abrir el panel de métricas ficticias.
11. Entrar a **Probar roles**, alternar entre Paciente, Psicólogo y Administrador y comprobar que la reserva se refleja en las tres vistas. Usar **Restablecer datos de la demo** antes de volver a presentar.
12. En **Planes**, explicar el modelo de pago por sesión, suscripción y B2B.

## Privacidad, ética y límites

Este es un **prototipo**, no un prestador habilitado de servicios de salud. **Las fotografías de profesionales representan personajes generados con inteligencia artificial; ninguna persona ilustrada es un profesional contratado o verificado. El selector de roles es público y no restringe acceso.** **No** ingresar nombres reales de pacientes, historias clínicas ni datos personales sensibles. Los profesionales, sus trayectorias, citas, precios, disponibilidad y métricas son ficticios. Las respuestas del cuestionario se procesan en memoria y no se guardan en el navegador ni se envían a un servidor. Las citas, planes y personajes **ficticios** se guardan en IndexedDB del navegador; cada dispositivo mantiene una copia independiente, sin servidor ni sincronización. No almacenar ningún dato clínico ni personal real.

Para convertirlo en un servicio comercial real en Colombia: validar habilitación profesional y del prestador, reglas de telesalud, consentimiento informado, privacidad, cifrado, respuesta a crisis, auditoría, pagos y derechos de acceso.

## Siguiente fase

- **0.7 (propuesta):** completar pruebas manuales de v0.6 en teléfonos reales, corregir hallazgos visuales, simplificar el código monolítico y hacer una revisión final de contenidos, accesibilidad y experiencia comercial. Mantener IndexedDB mientras siga siendo una demostración.
- **Fase comercial futura:** profesionales habilitados, autenticación segura y datos protegidos (Supabase), disponibilidad y cancelaciones reales, cobros integrados, y protocolos clínicos y empresariales bajo asesoría especializada.

> No publicar secretos ni credenciales en este repositorio público.

## Demostración local — funcionamiento y límites

- Los datos de prueba iniciales se crean la primera vez que se visita el sitio: 3 pacientes, 3 profesionales, 3 planes y 3 citas simuladas.
- Los cambios realizados en **IndexedDB** permanecen después de actualizar la página en **ese navegador**. No se transfieren entre dispositivos ni cuentas.
- Para preparar una nueva exposición, entrar en **Probar roles → Restablecer datos de la demo**.
- Si se bloquea el almacenamiento del navegador (p. ej., modo privado restrictivo), la app muestra un aviso en lugar de enviar datos a un servidor.
- El chequeo orientativo de bienestar **no guarda** respuestas en la base de datos local.
- El ejercicio de respiración es educativo y de uso opcional; permite pausar y reiniciar, y respeta las preferencias de movimiento reducido.

**Importante:** ni IndexedDB ni el selector de roles son un mecanismo de seguridad o autenticación. No introducir datos de pacientes, resultados de salud ni información confidencial real.

## Navegación y accesibilidad v0.5

- En móvil se muestran tres accesos rápidos: **Inicio**, **Citas** y **Recorrido**, además del menú completo.
- El recorrido guiado es opcional y puede cerrarse, retrocederse o saltar a otro paso. No envía datos ni hace reservas por su cuenta.
- Con teclado, **Saltar al contenido principal** aparece al recibir foco. **Escape** cierra el menú móvil o el recorrido.
- La opción del sistema **Reducir movimiento** desactiva los efectos decorativos. Las animaciones no representan progreso clínico ni promesas de mejora.

Los indicadores de negocio y resultados de bienestar exhibidos son ficticios. No hay servicios psicológicos reales ofrecidos por esta demostración.

## Control de calidad v0.6

Para revisar la versión desde el propio navegador, abre **Probar roles → Verificar demo en este navegador**. La comprobación realiza lecturas de IndexedDB y carga los retratos, compara su resolución y comprueba diferencias de píxeles (no modifica citas ni planes). La matriz detallada de aceptación está en [docs/PRUEBAS_V06.md](docs/PRUEBAS_V06.md) y los resultados de la suite en [docs/QA_V06_RESULTADOS.md](docs/QA_V06_RESULTADOS.md). **La compilación y las 59 pruebas automatizadas en Chromium no sustituyen las pruebas manuales en dispositivos reales, lectores de pantalla, contraste WCAG y revisión estética.**
