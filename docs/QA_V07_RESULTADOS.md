# EquilibraMind v0.7 — Resultados de revisión y QA

**Fecha de ejecución:** 19 de noviembre de 2026  
**Rama revisada:** `feat/v0.7` (commit de partida `acf63a6`, base `main` en `b8372b2`)  
**Ámbito:** build local de producción, Chromium aislado y auditoría axe-core  
**Datos:** exclusivamente ficticios; IndexedDB local, sin cuentas, pagos ni información clínica real.  
**Estado:** PR #2 abierto y sin fusionar. No se publicó nada en producción.

---

## 1. Resumen ejecutivo

| Verificación | Resultado | Detalle |
|---|---|---|
| `npm ci` | ✅ Aprobado | 33 paquetes instalados desde el lockfile |
| `npm run typecheck` | ✅ Aprobado | `tsc --noEmit` sin errores |
| `npm run build` | ✅ Aprobado | Next.js 16.4.6, 4 rutas estáticas |
| `npm run test:unit` | ✅ 3/3 | Invariantes de personajes, profesionales y planes |
| `npm run test:e2e` | ✅ 63/63 | Playwright 1.65.1 / Chromium, 4 workers |
| `e2e/polish-v07.spec.ts` | ✅ 4/4 | Las cuatro pruebas nuevas de v0.7 |
| Regresión sobre v0.6 | ✅ 59/59 | Las 59 pruebas anteriores siguen aprobadas |
| Capturas responsive | ✅ 21/21 | 7 vistas × 3 anchos, regeneradas |
| axe-core (componentes v0.7) | ✅ 0 fallos | Tras las correcciones de contraste |
| axe-core (global) | ⚠️ 654 nodos heredados | Todos existían ya en `main`; ver §7 |
| Desbordamiento horizontal | ✅ 0 px | 16 anchos × 8 vistas = 128 combinaciones |
| GitHub Actions | ⏳ Pendiente | Se ejecutará al publicar el commit de correcciones |

**Conclusión:** v0.7 compila, pasa TypeScript, las 3 unitarias y las 63 E2E. Se corrigieron un defecto real de breakpoint y cuatro problemas de accesibilidad introducidos o visibles en la nueva propuesta. No se detectaron regresiones funcionales ni desbordamientos. Queda deuda de contraste heredada de v0.6 que requiere una pasada de diseño específica, además de las validaciones manuales de §9.

---

## 2. Alcance del diff revisado

Diff inicial `main...feat/v0.7` (`acf63a6`): 6 archivos, +366 / −1.

| Archivo | Cambio |
|---|---|
| `app/components/CompanyJourney.tsx` | Nuevo recorrido B2B de tres etapas, marcado como modelo académico |
| `app/page.tsx` | Integración del recorrido, etiqueta de fecha en español y ajustes menores |
| `app/globals.css` | Nuevo bloque v0.7 (composición responsive, B2B, Mi espacio) |
| `e2e/polish-v07.spec.ts` | Cuatro pruebas nuevas |
| `docs/REVISIÓN_V07.md` | Informe de encargo |
| `README.md` | Sección de la versión en revisión |

En esta revisión se añadieron correcciones acotadas en `app/globals.css` y `app/page.tsx`, y este informe.

---

## 3. Método

- Servidor con **build de producción** en `http://127.0.0.1:3100` (`next start`), no modo desarrollo.
- Cada prueba E2E usa un **contexto de navegador nuevo** con IndexedDB vacía y datos ficticios sembrados por la app.
- Capturas full-page con `prefers-reduced-motion: reduce`, imágenes `loading="lazy"` forzadas y espera de carga.
- Barrido de desbordamiento con Playwright en **320, 360, 375, 414, 480, 570, 571, 600, 768, 800, 801, 900, 1024, 1100, 1101 y 1440 px**, en las ocho vistas (incluido el panel de empresa y los paneles por rol). Se compara `documentElement.scrollWidth` con el viewport y se revisan cajas fuera de rango.
- Auditoría de accesibilidad con **axe-core 4.14.1** inyectado en la página, reglas `wcag2a`, `wcag2aa`, `wcag21a` y `wcag21aa`.

> **Nota metodológica sobre axe:** la primera pasada reportó cientos de falsos positivos de contraste porque la transición de página (`equilibra-section-arrive`, 480 ms) dejaba los elementos a opacidad intermedia. Las cifras de este informe se obtuvieron con movimiento reducido, transiciones y animaciones desactivadas y una espera de estabilización. Sin ese ajuste, axe llega a leer un `h1` como `#ebeae5` cuando su color real es `#293a32`.

Comandos reproducibles:

```bash
npm ci
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

`axe-core` se instaló con `--no-save` solo para esta auditoría; **no** se añadió a `package.json` ni al lockfile, por lo que la CI no ejecuta axe todavía.

---

## 4. Resultados por suite

| Archivo | Casos | Estado |
|---|---:|---|
| `e2e/navigation.spec.ts` | 7 | ✅ |
| `e2e/quiz.spec.ts` | 4 | ✅ |
| `e2e/guided.spec.ts` | 4 | ✅ |
| `e2e/professionals.spec.ts` | 5 | ✅ |
| `e2e/booking.spec.ts` | 9 | ✅ |
| `e2e/persistence.spec.ts` | 4 | ✅ |
| `e2e/roles.spec.ts` | 4 | ✅ |
| `e2e/reset.spec.ts` | 2 | ✅ |
| `e2e/breathing.spec.ts` | 3 | ✅ |
| `e2e/accessibility.spec.ts` | 7 | ✅ |
| `e2e/responsive.spec.ts` | 10 | ✅ |
| `e2e/polish-v07.spec.ts` | 4 | ✅ |
| **Total E2E** | **63** | **✅ 63/63** |
| `tests/unit/demo-data.test.ts` | 3 | ✅ 3/3 |

### Pruebas nuevas de v0.7

| Prueba | Qué verifica | Resultado |
|---|---|---|
| Cuestionario a 1440 px | `.quiz-panel` con `min-height: 0` y título visible | ✅ |
| Tableta a 768 px | Tercer profesional y tercera estadística ocupan el ancho | ✅ |
| B2B y fecha | Tres etapas, aviso de simulación y fecha escrita en español | ✅ |
| Mi espacio | Tres ideas opcionales y agenda de demostración intacta | ✅ |

---

## 5. Correspondencia con `docs/REVISIÓN_V07.md`

| Observación | Estado | Evidencia |
|---|---|---|
| Cuestionario con espacio vacío en escritorio | ✅ Resuelto | `.quiz-panel` mide 462 px frente a 782 px del aside a 1440 px; E2E exige `min-height: 0` |
| Tercera tarjeta del directorio sola en tableta | ✅ Resuelto | A 768 px la tercera tarjeta mide 724 px y las dos primera 352 px; botones operables |
| Tercera estadística sola en tableta | ✅ Resuelto | A 768 px la tercera estadística ocupa 658 px y las dos primeras 323 px |
| Columnas descompensadas en «Mi espacio» | ✅ Resuelto | Tarjeta opcional de tres pasos a 1440 px y a 375 px sin desbordar |
| Propuesta B2B poco secuenciada | ✅ Resuelto | Tres fases con numeración, iconos y aviso explícito de simulación |
| Calendario nativo con formato inglés | ✅ Resuelto | Texto complementario `es-CO`: «Fecha seleccionada: 30 de diciembre de 2026» |

Comprobaciones adicionales del encargo:

- La tarjeta horizontal del tercer profesional y la tercera estadística **no se desbordan** en 571–800 px; los botones conservan su ancho y son operables.
- La nueva tarjeta de «Mi espacio» no empuja controles fuera del viewport ni oculta la barra fija; a 375 px se apila correctamente.
- La redacción B2B describe un modelo propuesto y repite que no representa un servicio contratado ni una implementación real.
- El selector de fecha conserva su valor ISO y añade la fecha legible en español.

---

## 6. Hallazgos y correcciones aplicadas

| ID | Severidad | Hallazgo | Corrección | Verificación |
|---|---|---|---|---|
| V07-01 | **Alta** | La regla del tercer profesional se aplicaba de 571 a 1100 px, pero entre 801 y 1100 px la rejilla ya tiene tres columnas. La tercera tarjeta se expandía a todo el ancho y rompía la composición. | Se limitó la regla a `571–800 px`, el único rango con dos columnas. | Medición a 801, 900 y 1100 px: las tres tarjetas miden 239, 272 y 339 px respectivamente. A 768 px se conserva la fila horizontal. |
| V07-02 | Media (accesibilidad) | Textos nuevos de v0.7 por debajo de AA: número de etapa 3.23:1, párrafo de etapa 4.17:1, aviso 3.46:1, entradilla 4.42:1, párrafo y pasos de «Mi espacio» entre 3.79 y 4.26:1. | Se oscurecieron solo los verdes de los componentes nuevos hasta ≥4.5:1, conservando la paleta. | axe: 0 nodos en `.company-journey-*`, `.space-ritual*` y `.booking-date-hint`. |
| V07-03 | Media (accesibilidad) | La etiqueta `.eyebrow` tenía 3.08:1 sobre marfil y 2.62:1 sobre el banner verde; se repite en casi todas las vistas. | `#6e9876` → `#4a7054`, que rinde entre 4.51:1 y 5.62:1 según el fondo. | axe: 0 nodos `.eyebrow`. |
| V07-04 | Media (accesibilidad) | El botón del logotipo tenía `aria-label="Volver al inicio"`, que no contiene el texto visible «equilibramind.» (WCAG 2.5.3). | `aria-label="equilibramind. Volver al inicio"`. | axe: 48 nodos de `label-content-name-mismatch` → 0. |

No se encontraron defectos en el contrato de IndexedDB, en los flujos de reserva, en la persistencia ni en los recorridos guiados.

---

## 7. Contraste y accesibilidad

### Antes y después (mismo método)

| Métrica | Antes | Después |
|---|---:|---:|
| Nodos `color-contrast` | 783 | 654 |
| Nodos `label-content-name-mismatch` | 48 | 0 |
| Selectores únicos normalizados con contraste bajo | 103 | 79 |
| Nodos en componentes nuevos de v0.7 | 42 | 0 |

La auditoría acotada a `.company-journey` y `.space-ritual` devuelve **0 violaciones** a 375, 768 y 1440 px.

Los 654 nodos restantes corresponden a **texto heredado de `main`**: grises y verdes de 10–12 px en pie de página, fichas de profesionales, planes, paneles por rol y textos secundarios. Ninguno pertenece a `CompanyJourney`, `space-ritual` ni a la etiqueta de fecha. Se mantienen como deuda conocida de v0.6 y **no se declaran aprobados**.

Ejemplos representativos de la deuda heredada:

| Elemento | Contraste actual | Fondo |
|---|---:|---|
| Pie de página, enlaces secundarios | 3.30:1 | `#f0f1e9` |
| Pie de página, nota legal | 2.66–2.70:1 | `#f0f1e9` |
| Fichas de profesionales, texto secundario | 3.03–3.89:1 | `#fffdfa` |
| Planes, descripción y precio secundario | 3.22–3.78:1 | `#fffdfa` |
| Paneles por rol, notas pequeñas | 2.70–3.83:1 | `#f0f5ed` |

**Recomendación:** abordar esta deuda en una iteración de accesibilidad dedicada, con tokens de color para texto secundario y una revisión de tamaños mínimos. Repintar toda la paleta dentro de este PR ampliaría demasiado el alcance y dificultaría la comparación visual con v0.6.

### Semántica

- axe no reportó fallos de estructura, nombres accesibles, `alt`, landmarks ni orden de encabezados en las ocho vistas.
- Se conserva un solo `h1` por vista.
- Las nuevas etapas usan `<ol>` y `<li>`; los números son `aria-hidden` para no duplicar la lectura.

---

## 8. Capturas responsive

Directorio: `docs/capturas/` — 21 JPEG full-page, 7 vistas × 3 anchos (375, 768 y 1440 px). Se regeneraron las 21 tras el ajuste de `.eyebrow`; las 21 cambiaron de bytes.

Revisión visual realizada sobre muestras de móvil, tableta y escritorio:

- **Cuestionario (1440):** el panel ya no se estira; termina tras el botón «Continuar».
- **Profesionales (768):** la tercera tarjeta ocupa una fila horizontal con imagen a la izquierda y contenido a la derecha; los botones caben.
- **Probar roles (768):** la tercera estadística ocupa las dos columnas sin quedar aislada.
- **Mi espacio (1440 y 375):** la tarjeta «Pequeños pasos para hoy» se integra sin empujar la agenda ni desbordar.
- **Para empresas (1440, 768 y 375):** las tres etapas se leen en orden y el aviso de simulación queda visible.
- **Paleta:** el verde salvia y el marfil se conservan; las etiquetas quedan algo más oscuras por la corrección de contraste.

La barra fija de accesos rápidos aparece en una posición intermedia en las capturas full-page por ser `position: fixed`; en uso real permanece anclada al borde inferior. Es el mismo comportamiento documentado en v0.6.

---

## 9. Validación manual pendiente

Estas comprobaciones **no se ejecutaron** y no deben considerarse aprobadas:

| ID | Validación pendiente | Motivo |
|---|---|---|
| M-01 | Chrome y Edge de escritorio reales | Solo se ejecutó Chromium de Playwright |
| M-02 | Android e iOS reales (Safari incluido) | Los emuladores no reproducen teclado, barra del navegador ni `safe-area` |
| M-03 | Lector de pantalla (NVDA, JAWS o VoiceOver) | La suite valida estructura y nombres, no la experiencia anunciada |
| M-04 | Contraste WCAG AA completo | Quedan 654 nodos heredados de v0.6; los componentes nuevos sí están corregidos |
| M-05 | Revisión estética de las 21 capturas por una persona | Se revisaron muestras, no las 21 una por una |
| M-06 | Firefox y WebKit | No se instalaron ni ejecutaron |
| M-07 | Formato del `input type="date"` en navegador en español | El control nativo depende del idioma del navegador; la etiqueta en español ya está verificada |
| M-08 | Validación del commit en Vercel/Netlify | No se publicó nada; el PR sigue abierto |
| M-09 | Rendimiento y Lighthouse | Fuera del alcance de esta iteración |
| M-10 | Ejecución de axe en CI | `axe-core` no se añadió a las dependencias; la auditoría fue local |

---

## 10. Archivos modificados en esta revisión

**Aplicación**

- `app/globals.css` — breakpoint del tercer profesional (571–800 px); contraste de `.eyebrow`, `CompanyJourney` y `space-ritual`.
- `app/page.tsx` — nombre accesible del logotipo.

**Documentación y evidencias**

- `docs/QA_V07_RESULTADOS.md` — este informe (nuevo).
- `docs/capturas/*.jpg` — 21 capturas regeneradas.

No se modificaron `package.json`, `package-lock.json`, el esquema de IndexedDB, los datos ficticios ni los flujos.

---

## 11. Restricciones respetadas

- Solo se trabajó en `feat/v0.7`; `main` no se tocó.
- El PR #2 no se fusionó ni se desplegó en producción.
- Se mantiene IndexedDB local, sin Supabase, cuentas, permisos reales ni cobros.
- No se introdujeron datos clínicos ni personales reales.
- Se conservaron los tres profesionales, tres pacientes, tres citas semilla, planes y avisos de simulación.
- Se respetó `prefers-reduced-motion` y el uso del teclado.
- Las correcciones se verificaron con la suite completa después de aplicarlas.

---

## 12. Recomendación

1. Revisar el commit de correcciones y las capturas actualizadas antes de aprobar el PR.
2. Confirmar la CI en verde al publicar la rama.
3. Programar una iteración de accesibilidad para los 654 nodos heredados de contraste.
4. Reservar M-01 a M-10 para un ensayo en dispositivos y navegadores reales.
5. No fusionar a `main` hasta completar la revisión humana y la aprobación del PR.
