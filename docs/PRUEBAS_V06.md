# EquilibraMind v0.6 — Control de calidad y pruebas de aceptación

**Fecha de corte:** 19 de noviembre de 2026  
**Ámbito:** demostración académica en https://equilibramind.vercel.app/  
**Datos:** únicamente ficticios; IndexedDB local, sin cuentas ni información clínica real.

## Objetivo de esta iteración

1. Solucionar el problema visual en el que dos personajes femeninos parecían la misma persona.
2. Facilitar la selección de horarios de ejemplo sin intentar reservar un horario ya ocupado.
3. Incorporar una comprobación local, de solo lectura, para datos e imágenes.
4. Preparar una matriz de pruebas manuales reproducibles para computador y celular.

## Cambios verificados mediante revisión de código

- El retrato de **Daniela Ríos** se encuentra en `/images/daniela-v06.avif`, diferente de `/images/laura-v06.avif` (Laura Méndez) y `/images/julian.avif` (Julián Herrera).
- Los tres retratos corresponden a **personajes sintéticos generados con IA**, no a personas habilitadas para prestar atención.
- La agenda deshabilita los horarios ya usados por otras reservas ficticias del mismo profesional y fecha, sin bloquear la cita propia al reprogramarla.
- Cambiar el profesional o la fecha borra la hora anterior para evitar confirmar una selección desactualizada.
- En **Probar roles → Verificar demo en este navegador** se ejecutan comprobaciones no destructivas de IndexedDB, relaciones entre registros y carga, dimensiones y diferencias visuales de miniaturas.

## Matriz para probar manualmente

| ID | Acción en el navegador | Resultado esperado |
|---|---|---|
| V06-01 | Abrir Profesionales | Laura, Daniela y Julián tienen imágenes distintas y nítidas |
| V06-02 | Abrir foto de Daniela en Chrome/Edge | Carga `daniela-v06.avif` correctamente |
| V06-03 | Elegir el mismo profesional, fecha y hora de una cita ya existente | La hora aparece como ocupada y no puede seleccionarse |
| V06-04 | Cambiar de fecha después de elegir una hora | La hora se limpia y debe volver a elegirse |
| V06-05 | Cambiar de profesional después de elegir una hora | La hora se limpia y debe volver a elegirse |
| V06-06 | Reprogramar una cita al mismo horario y profesional | La cita propia no bloquea ese horario |
| V06-07 | Confirmar una reserva válida | Aparece confirmación y la cita figura en Mi espacio |
| V06-08 | Recargar Edge | La reserva se conserva en IndexedDB del mismo navegador |
| V06-09 | Abrir Probar roles → Psicólogo | La agenda del profesional refleja la cita guardada |
| V06-10 | Abrir Probar roles → Administrador | La cantidad y valores de reservas se actualizan |
| V06-11 | Cancelar desde Mi espacio | Disminuyen los conteos y la cita deja de estar activa |
| V06-12 | Restablecer datos de la demo | Se regeneran los personajes, planes y citas de ejemplo |
| V06-13 | Pulsar Verificar demo en este navegador | Se presentan comprobaciones de IndexedDB, referencias y retratos |
| V06-14 | Iniciar recorrido personal | Avanza desde Inicio hasta demo, sin crear pagos ni citas por sí solo |
| V06-15 | Iniciar recorrido empresarial | Abre la propuesta B2B, panel de ejemplo y planes |
| V06-16 | Emular ancho de 375 px y probar celular real | No hay desplazamiento horizontal ni texto/botones cortados |
| V06-17 | Navegar usando Tab y Escape | Enlaces, menús y paneles pueden operarse sin mouse |
| V06-18 | Activar Reducir movimiento | Sin animaciones distractoras; contenido sigue siendo legible |
| V06-19 | Completar el chequeo orientativo | Muestra orientación educativa sin diagnóstico ni persistencia clínica |

**Estados:** La compilación de Next.js/TypeScript se valida con el despliegue en Vercel. Las pruebas de clics, accesibilidad real, fotografía en pantalla y persistencia del navegador requieren interacción manual; no deben marcarse como aprobadas sin ejecutarse.

## Guion breve para controlar el demo

1. Entrar en **Probar roles** y pulsar **Restablecer datos de la demo**.
2. En la misma pantalla pulsar **Verificar demo en este navegador**. Registrar el número de comprobaciones correctas.
3. Ir a **Profesionales** y comparar los tres retratos.
4. Reservar una sesión de ejemplo, mostrar su persistencia y revisar paneles por rol.
5. Cancelarla y repetir la prueba de conteo.
6. Probar una segunda vez en móvil, incluyendo el menú y los recorridos guiados.
7. Dejar los datos restablecidos antes de la exposición.

## Criterios de entrega v0.6

- Vercel indica estado READY en el commit de la versión.
- La pantalla de Profesionales referencia tres archivos de retratos independientes, con Daniela reemplazada y caché evitada mediante un nombre nuevo.
- El flujo impide elegir un horario ficticio ocupado, mientras permite reprogramar la reserva propia.
- La utilidad de diagnóstico no cambia ni elimina registros.
- Toda cifra empresarial, identidad profesional y reserva sigue identificada como simulación.

## Riesgos y límites explícitos

- IndexedDB se almacena únicamente en el navegador, se puede borrar al eliminar datos del sitio y no representa seguridad ni autenticación.
- La verificación comprueba archivos y relaciones de ejemplo, no certifica la calidad estética o el desempeño en cada dispositivo.
- La disponibilidad de citas es **simulada**, no integra agendas profesionales reales.
- El cuestionario no es una escala clínica validada.
- Antes de prestar atención real harían falta regulación aplicable, autorización de profesionales, consentimiento informado, privacidad, auditoría, respuesta a crisis y un backend seguro.

## Revisión adicional de retratos — v0.6.1

- Se publican dos retratos independientes de alta calidad con URL nuevas: `laura-v06.avif` y `daniela-v06.avif`, para evitar que el navegador reutilice imágenes antiguas.
- En **Probar roles → Verificar demo** se comprueba carga y dimensiones de los tres retratos, y que sus miniaturas de 20 × 20 píxeles no sean iguales o casi iguales. Esto no certifica identidad ni sustituye revisión humana.
- **Pendiente de prueba manual:** confirmar encuadres y estética en Edge de escritorio y móvil, hacer clic en los recorridos, comprobar persistencia en IndexedDB y evaluar accesibilidad real. La compilación no equivale a superar esas pruebas.
