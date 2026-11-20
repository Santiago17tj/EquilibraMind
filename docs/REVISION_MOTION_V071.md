# EquilibraMind v0.7.1 — Intro animada y motion design

**Rama:** `feat/v0.7.1-motion-intro`  
**Base:** versión estable v0.7, commit `592673f`  
**Estado:** cambios preparados para PR y auditoría por OpenCode. Producción se mantiene intacta.

## Experiencia creada

La primera vez que se abre una pestaña, aparece una pantalla de bienvenida verde salvia y marfil. Presenta el logotipo ficticio, dos anillos que se expanden suavemente como una respiración, una hoja en movimiento y la frase «A veces, todo empieza con una pausa». La animación se cierra automáticamente; «Entrar ahora» o Escape la omiten.

- La presentación dura **~2,2 segundos**, contando la salida.
- Solo aparece una vez por pestaña mediante `sessionStorage`. Recargar no la repite.
- Se omite por completo cuando `prefers-reduced-motion: reduce`, y desaparece si se cambia dicha preferencia mientras se reproduce.
- **No captura el teclado ni bloquea clics en la página**: el contenido es operable durante la animación.
- No realiza lecturas clínicas, peticiones de red, autenticación ni cambios en IndexedDB.
- Si JavaScript está deshabilitado, la bienvenida no retrasa el contenido.

## Refinamientos complementarios

- Tarjetas del recorrido B2B: entrada escalonada breve y desplazamiento sutil al pasar el cursor.
- Opciones de cuestionario, atajos, filtros y tarjetas de rol: realce discreto en hover y pulsación.
- Estilo de foco visible para el botón «Entrar ahora».
- Animaciones y efectos decorativos condicionados a preferencias del sistema y capacidad hover.
- Sin nuevas dependencias ni cambios a las reglas de reserva, datos ficticios, tarifas o API.

## Riesgos que OpenCode debe revisar

1. **Regresión de navegación/teclado:** confirmar que el enlace «Saltar al contenido principal» sigue recibiendo el primer Tab, que Escape funciona y que menús y recorridos guiados permanecen accesibles.
2. **Interferencia visual:** verificar superposiciones del overlay en 320, 375, 768 y 1440 px y especialmente el botón de omisión en móviles con áreas seguras.
3. **Carga/hidratación:** detectar parpadeos del overlay por montaje de React y posibles errores de consola.
4. **Pruebas existentes:** la intro no debe interferir con las 63 E2E anteriores, especialmente las de capturas responsive y teclado.
5. **Movimiento reducido:** medir que no aparezcan animaciones al solicitar `prefers-reduced-motion: reduce`.
6. **Contraste:** la deuda histórica de 654 nodos que identificó OpenCode en v0.7 sigue pendiente; no afirmar conformidad WCAG por esta tarea.
7. **Firefox/Safari/WebKit:** comprobar comportamiento de `sessionStorage`, `matchMedia` y transiciones cuando el entorno lo permita.
8. **Rendimiento:** evaluar si el intro afecta a Lighthouse/LCP o causa movimientos no deseados de diseño. Reducir duración/efectos si hace falta.

## Guion de pruebas

```bash
npm ci
npm run typecheck
npm run build
npm run test:unit
npm run test:e2e
npx playwright test e2e/intro-motion.spec.ts
```

La suite añade cinco verificaciones para la intro: aparición y botón, una visita por pestaña, cierre automático/Escape, preferencia de movimiento reducido y navegación móvil durante la escena.

**Entregables de OpenCode:** revisar y corregir exclusivamente en esta rama, repetir las pruebas, regenerar capturas si la UI se modifica y preparar `docs/QA_MOTION_V071_RESULTADOS.md` con evidencia real de resultados. Mantener PR abierto hasta aprobación, sin fusionar automáticamente ni cambiar producción.
