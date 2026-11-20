# EquilibraMind v0.6 — Resultados de QA automatizada

**Fecha de ejecución:** 19 de noviembre de 2026  
**Commit base auditado:** `477a588` (`main`)  
**Ámbito:** build local de producción, navegador Chromium aislado  
**Producción consultada (solo lectura):** https://equilibramind.vercel.app/ → HTTP 200  
**Datos:** exclusivamente ficticios; IndexedDB local, sin cuentas, pagos ni información clínica real.

---

## 1. Resumen ejecutivo

| Verificación | Resultado | Detalle |
|---|---|---|
| `npm run typecheck` | ✅ Aprobado | `tsc --noEmit` sin errores |
| `npm run build` | ✅ Aprobado | Next.js 16.4.6, compilación correcta, 4 rutas estáticas |
| `npm run test:unit` | ✅ 3/3 | Invariantes de personajes, profesionales y planes |
| `npm run test:e2e` | ✅ 59/59 | Chromium 1255 (Playwright 1.65.1) |
| **Total automatizado** | **62/62** | 0 fallidas, 0 omitidas |
| Capturas responsive | ✅ 21/21 | 7 vistas × 3 anchos (375, 768, 1440 px) |
| GitHub Actions (`QA v0.6`) | ✅ 3/3 jobs | TypeScript/unitarias, build y Playwright en Ubuntu |
| Producción | ✅ HTTP 200 | Comprobación HEAD; no se publicó ningún cambio |

**Conclusión:** la versión auditada compila, pasa TypeScript y supera la suite automatizada en Chromium. Quedan validaciones manuales que no pueden certificarse con estas pruebas (dispositivos reales, lectores de pantalla, contraste WCAG completo y revisión estética humana).

---

## 2. Método y aislamiento

- El servidor de pruebas se levanta con el **build de producción** en `http://127.0.0.1:3100`.
- Cada caso de Playwright usa un **contexto de navegador nuevo**: IndexedDB arranca vacío y se siembra con los datos ficticios de la app. No se reutiliza el perfil del usuario.
- Las pruebas leen IndexedDB directamente para verificar persistencia real, sin modificar la base desde el test.
- Los `window.confirm` se controlan con `page.once("dialog")` para probar aceptar y cancelar.
- El ejercicio de respiración usa el reloj simulado de Playwright para verificar el minuto completo sin esperas reales.
- Las capturas se toman con movimiento reducido y con las imágenes `loading="lazy"` previamente cargadas.

Comandos reproducibles:

```bash
npx playwright install chromium   # primera vez
npm run typecheck
npm run test:unit
npm run test:e2e
```

Reportes generados (ignorados por Git): `playwright-report/` (HTML) y `test-results/results.json` (JSON).

### Integración continua

El flujo `.github/workflows/qa.yml` se ejecuta en cada `pull_request` hacia `main` y en cada `push` a `main`, además de permitir ejecución manual. Usa `ubuntu-latest`, Node.js 24 y `npm ci` para reproducir el lockfile:

| Job | Contenido |
|---|---|
| TypeScript y unitarias | `npm run typecheck` y `npm run test:unit` |
| Build de producción | `npm run build` |
| Playwright (Chromium) | Instala Chromium con dependencias del sistema y ejecuta `npm run test:e2e`; publica `playwright-report/` y `test-results/` como artefacto durante 7 días |

La primera ejecución en Linux detectó una fragilidad real de la suite: la prueba del enlace **Saltar al contenido** leía `top` con `getComputedStyle` mientras la transición aún estaba en curso (`-9.87 px`). Se sustituyó por `toHaveCSS("top", "0px")` con reintento y una comprobación de viewport. La ejecución posterior terminó con los tres jobs en verde.

---

## 3. Resultados por suite

| Archivo | Casos | Estado | Cobertura |
|---|---:|---|---|
| `e2e/navigation.spec.ts` | 7 | ✅ | Cabecera, cinco secciones, logotipo, pie, menú móvil, Escape y accesos rápidos |
| `e2e/quiz.spec.ts` | 4 | ✅ | Avance/retroceso, validación, dos puntuaciones, reinicio y no persistencia |
| `e2e/guided.spec.ts` | 4 | ✅ | Recorrido personal (6 pasos), empresarial (5 pasos), Atrás, Escape y salto de paso |
| `e2e/professionals.spec.ts` | 5 | ✅ | Tres retratos AVIF, filtros, ficha ampliada, selección para reserva y diagnóstico local |
| `e2e/booking.spec.ts` | 9 | ✅ | Horarios ocupados, limpieza de hora, cita propia, alta virtual/presencial, cambio, cancelación y validaciones |
| `e2e/persistence.spec.ts` | 4 | ✅ | Recarga, preferencias, una cita por personaje y aislamiento entre contextos |
| `e2e/roles.spec.ts` | 4 | ✅ | Coherencia paciente ↔ psicólogo ↔ administrador y conteos tras cancelar |
| `e2e/reset.spec.ts` | 2 | ✅ | Restablecimiento completo y cancelación del diálogo sin cambios |
| `e2e/breathing.spec.ts` | 3 | ✅ | Inicio, pausa, reinicio, minuto completo, movimiento reducido y widget compacto |
| `e2e/accessibility.spec.ts` | 7 | ✅ | `lang`, un `h1` por vista, salto al contenido, foco visible, nombres accesibles, `alt`, Escape y movimiento reducido |
| `e2e/responsive.spec.ts` | 10 | ✅ | 375/768/1440 px, sin desbordamiento horizontal, elementos dentro del viewport y capturas |
| `tests/unit/demo-data.test.ts` | 3 | ✅ | Tres pacientes, tres profesionales distintos y tarifas de los tres planes |

### Correspondencia con la matriz V06

| ID | Prueba | Estado |
|---|---|---|
| V06-01, V06-02 | Retratos distintos, carga y resolución de los tres AVIF | ✅ Automatizada |
| V06-03 | Horario ocupado deshabilitado | ✅ Automatizada |
| V06-04, V06-05 | Cambiar fecha o profesional limpia la hora | ✅ Automatizada |
| V06-06 | La cita propia no bloquea su horario | ✅ Automatizada |
| V06-07 | Reserva creada y visible en Mi espacio | ✅ Automatizada |
| V06-08 | Persistencia tras recargar | ✅ Automatizada |
| V06-09, V06-10 | Reflejo en agenda del psicólogo y panel administrador | ✅ Automatizada |
| V06-11 | Cancelación y actualización de conteos | ✅ Automatizada |
| V06-12 | Restablecer datos de la demo | ✅ Automatizada |
| V06-13 | Verificar demo en este navegador | ✅ Automatizada (4/4 comprobaciones) |
| V06-14, V06-15 | Recorridos personal y empresarial | ✅ Automatizada |
| V06-16 | 375 px sin desplazamiento horizontal | ✅ Automatizada + captura |
| V06-17 | Tab, Escape y foco visible | ✅ Automatizada |
| V06-18 | Reducir movimiento | ✅ Automatizada |
| V06-19 | Chequeo orientativo completo | ✅ Automatizada |

---

## 4. Hallazgos y correcciones aplicadas

| ID | Severidad | Hallazgo | Corrección | Verificación |
|---|---|---|---|---|
| A11Y-01 | Media | La vista **Probar roles** no tenía ningún `h1`; el encabezado visual era un `h2`, por lo que la página carecía de título principal para lectores de pantalla y estructura semántica. | Se añadió un `h1` solo para lectores de pantalla (`sr-only`) en `app/page.tsx` y la utilidad `.sr-only` en `app/globals.css`. No cambia el diseño visible. | `accessibility.spec.ts` exige exactamente un `h1` en las siete vistas. |
| UX-01 | Baja | Al cambiar de personaje de paciente en el formulario, se conservaban la fecha y la hora elegidas para el personaje anterior; podía mostrarse una selección heredada y confusa. | `selectDemoPatient` ahora limpia `bookingDate` y `bookingHour`. | `booking.spec.ts` verifica que fecha y hora queden vacías y que el selector de hora se deshabilite. |
| BUILD-01 | Informativa | Turbopack infería como raíz `C:\Users\Isabel` por un `package-lock.json` externo al repositorio, generando advertencias en build y `next start`. | Se agregó `next.config.ts` con `turbopack.root` y `outputFileTracingRoot` apuntando al proyecto. | `npm run build` termina sin advertencias. |
| QA-01 | Interna de la suite | El lector de IndexedDB podía ejecutarse antes de que la app creara la base y, al abrirla con versión, dejaba una base vacía sin almacenes. | `readDb` ahora espera a que `indexedDB.databases()` exponga la base y comprueba que existan los cinco almacenes antes de leer. No crea la base. | Toda la suite de persistencia y reservas. |
| QA-02 | Interna de la suite | Las capturas full-page no cargaban imágenes `loading="lazy"` fuera del viewport y podían quedar en blanco. | La preparación de capturas recorre la página, fuerza carga y espera cada imagen con límite de 3 s. | 21 capturas generadas y revisadas. |
| QA-03 | Interna de la suite | En Linux CI, la prueba del enlace de salto leía `top` a mitad de la transición y fallaba de forma intermitente. | Se usa `toHaveCSS` con reintento y `toBeInViewport` en lugar de leer el estilo una sola vez. | 21/21 en tres repeticiones locales y job de Playwright en verde. |

Durante la construcción de la suite hubo fallos transitorios de selectores ambiguos y de sincronización con el reloj simulado. Se corrigieron en las pruebas; **no eran defectos de la aplicación**. La ejecución final no tiene fallos.

---

## 5. Capturas responsive

Directorio: `docs/capturas/` — 21 archivos JPEG full-page, movimiento reducido, 7 vistas por ancho.

| Ancho | Vistas |
|---|---|
| 375 px (`movil-375-*`) | inicio, chequeo, profesionales, empresas, planes, espacio, demo |
| 768 px (`tableta-768-*`) | inicio, chequeo, profesionales, empresas, planes, espacio, demo |
| 1440 px (`escritorio-1440-*`) | inicio, chequeo, profesionales, empresas, planes, espacio, demo |

Comprobaciones automáticas asociadas:

- `document.documentElement.scrollWidth` y `document.body.scrollWidth` ≤ ancho del viewport + 1 px.
- Cajas de hero, cabecera, formulario de reserva, plan, tarjeta de espacio y panel de roles dentro del ancho visible.
- Barra de accesos rápidos visible solo ≤ 800 px.
- Guía móvil contenida dentro de 375 × 812 px.

**Revisión visual humana:** se inspeccionaron muestras de móvil, tableta y escritorio. No se observaron cortes de texto, solapamientos estructurales ni cambios de la paleta verde salvia/marfil. La barra fija de accesos rápidos aparece en una posición intermedia en las capturas full-page por ser un elemento `position: fixed`; en uso real permanece anclada al borde inferior.

---

## 6. Validación manual pendiente

Estas pruebas **no se ejecutaron** y no deben considerarse aprobadas:

| ID | Validación pendiente | Motivo |
|---|---|---|
| M-01 | Chrome y Edge de escritorio reales | Solo se ejecutó Chromium de Playwright |
| M-02 | Android e iOS reales (Safari incluido) | Los emuladores no reproducen teclado, barra del navegador ni `safe-area` reales |
| M-03 | Lector de pantalla (NVDA, JAWS o VoiceOver) | La suite valida estructura y nombres, no la experiencia anunciada |
| M-04 | Contraste WCAG AA con axe/DevTools | No se ejecutó una auditoría de contraste automatizada |
| M-05 | Revisión estética de las 21 capturas por una persona | Solo se revisaron muestras |
| M-06 | Firefox y WebKit | No se instalaron ni ejecutaron |
| M-07 | Formato del `input type="date"` en navegador en español | Depende del idioma de la interfaz del navegador, no de la app |
| M-08 | Validación del commit en Vercel/Netlify | No se publicó nada; solo se comprobó HTTP 200 de la producción actual |
| M-09 | Rendimiento y Lighthouse | Fuera del alcance de esta iteración |

---

## 7. Archivos modificados y creados

**Aplicación**

- `app/page.tsx` — `h1` accesible en la vista de roles; limpieza de fecha/hora al cambiar de personaje.
- `app/globals.css` — utilidad `.sr-only`.
- `next.config.ts` — raíz de Turbopack/output tracing (nuevo).
- `next-env.d.ts` — regenerado por Next.js 16.4.6.
- `tsconfig.json` — `allowImportingTsExtensions` para la prueba unitaria en Node.
- `package.json` — scripts `test:unit`, `test:e2e`, `test:e2e:headed`, `test:e2e:report`; `@playwright/test`.
- `package-lock.json` — lockfile reproducible (nuevo).
- `.gitignore` — reportes y resultados de Playwright.

**Pruebas y documentación**

- `playwright.config.ts` — configuración Chromium, servidor de producción y reportes (nuevo).
- `.github/workflows/qa.yml` — CI con TypeScript, unitarias, build y Playwright (nuevo).
- `e2e/helpers.ts` + 11 archivos `e2e/*.spec.ts` — 59 pruebas (nuevos).
- `tests/unit/demo-data.test.ts` — 3 pruebas unitarias (nuevo).
- `docs/QA_V06_RESULTADOS.md` — este informe (nuevo).
- `docs/capturas/` — 21 capturas responsive (nuevo).
- `docs/PRUEBAS_V06.md` — sección de automatización incorporada.
- `README.md` — comandos y alcance de las pruebas.

---

## 8. Restricciones respetadas

- Se mantiene **IndexedDB** como única base local.
- No se agregó Supabase, autenticación ni pagos reales.
- Se conservaron los tres profesionales, tres pacientes, planes y avisos ficticios.
- No se introdujeron datos clínicos ni personales reales.
- Las pruebas se ejecutaron en contextos de navegador aislados.
- No se publicaron cambios en producción ni se ejecutaron comandos destructivos.
- No se alteró el diseño visual verde salvia y marfil; los cambios visuales son nulos o invisibles.

---

## 9. Recomendación para la demostración

1. Ejecutar `npm run test:e2e` antes de la exposición y confirmar 59/59.
2. Abrir **Probar roles → Restablecer datos de la demo** en el navegador que se usará.
3. Pulsar **Verificar demo en este navegador** y confirmar 4/4.
4. Revisar las capturas de `docs/capturas/` para la comparación visual de la presentación.
5. Reservar las validaciones M-01 a M-05 para un ensayo en el equipo real de exposición.
