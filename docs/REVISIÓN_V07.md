# EquilibraMind v0.7 — revisión de experiencia y propuesta comercial

**Estado:** rama `feat/v0.7` pendiente de revisión por OpenCode y CI. **No fusionar directamente**.

## Alcance implementado

| Observación de v0.6 | Cambio preparado en v0.7 | Evidencia esperada |
|---|---|---|
| Cuestionario con espacio vacío en escritorio | En anchuras ≥1101 px no existe altura mínima rígida para `.quiz-panel`; se alinea arriba | Captura y E2E a 1440 px |
| Tercera tarjeta del directorio sola en tableta | La última tarjeta impar ocupa una fila horizontal con imagen y contenido | Captura a 768 px con tres perfiles |
| Tercera estadística del panel sola en tableta | La última estadística impar ocupa las dos columnas solo entre 571 y 800 px | Captura de «Probar roles» a 768 px |
| Columnas descompensadas en «Mi espacio» | Una tarjeta informativa opcional de tres pasos acompaña la reserva y reduce el vacío visual | Captura a 1440 px y legibilidad móvil |
| Propuesta B2B poco secuenciada | Componente `CompanyJourney` presenta tres fases propuestas, claramente simuladas | Captura de «Para empresas» y texto verificable |
| Calendario nativo con formato inglés en captura | Texto complementario formateado explícitamente con `es-CO` al seleccionar día | Prueba con navegador en `en-US` y `es-CO` |

## Restricciones innegociables

- Mantener **IndexedDB local**, perfiles, precios y datos ficticios.
- No introducir Supabase, cuentas, permisos reales, cobros ni datos clínicos reales.
- No prometer atención psicológica habilitada ni resultados empresariales medidos.
- Conservar la paleta verde salvia y marfil, el aspecto profesional, el menú, los recorridos y el uso del teclado.
- Preferencia `prefers-reduced-motion` respetada.
- No integrar a `main` sin pruebas y revisión.

## Revisión solicitada a OpenCode

1. Obtener `feat/v0.7` y revisar el diff respecto a `main`, **sin sobrescribir cambios locales ajenos**.
2. Ejecutar `npm ci`, `npm run typecheck`, `npm run build`, `npm run test:unit` y `npm run test:e2e`.
3. Ejecutar expresamente `e2e/polish-v07.spec.ts`, y revisar las regresiones sobre las 59 E2E anteriores.
4. Generar nuevamente capturas `docs/capturas/` a 375, 768 y 1440 px; revisar las siete vistas en cada tamaño.
5. Comprobar que la tarjeta horizontal del tercer profesional y la tercera estadística **no se desborden**, no creen huecos y conserven botones operables.
6. Verificar en navegador que el cuestionario no tenga exceso de altura interna en la primera pregunta.
7. Revisar «Mi espacio» a 1440 px y a 375 px, comprobando que la nueva tarjeta no empuje controles fuera del viewport ni oculte la barra fija.
8. Revisar redacción empresarial para que sea persuasiva pero **inequívocamente ficticia**.
9. Revisar fecha nativa en Edge/Chrome (`es-CO`/`en-US`) y el texto suplementario en español.
10. Correr `axe-core` o herramienta equivalente sobre las vistas y documentar **hallazgos** de contraste y semántica, sin declarar una certificación completa WCAG.
11. Revisar con Firefox/WebKit si el entorno lo permite, o marcarlo como pendiente.
12. Si aparece un defecto real, corregir **solo en `feat/v0.7`** y volver a ejecutar las pruebas.
13. Entregar `docs/QA_V07_RESULTADOS.md` con comandos, versión, resultados y capturas; actualizar el PR. No fusionarlo ni desplegarlo en producción.

## Criterios de aceptación

- `typecheck`, `build`, pruebas unitarias y todas las E2E (incluidas las nuevas) pasan en Chromium.
- Las tres observaciones visuales concretas quedan resueltas en capturas comparadas con v0.6.
- B2B presenta tres fases sin afirmar servicios efectivamente contratados.
- El selector de fecha conserva su funcionamiento y añade orientación en español.
- Ningún cambio en el contrato de datos de IndexedDB ni en la naturaleza ficticia de la demo.
- El PR queda abierto para inspección humana hasta recibir aprobación.

**Advertencia:** añadir las pruebas al repositorio no equivale a haberlas ejecutado. La ejecución real y la revisión estética son responsabilidad del revisor y de CI.
