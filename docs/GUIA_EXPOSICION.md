# EquilibraMind v0.5 — Guía de exposición y pruebas

> **Prototipo académico y comercial ficticio.** No es un prestador de servicios de salud; las identidades, profesionales, empresas, citas, valores e indicadores son simulados. Las fotografías de profesionales fueron generadas con IA. Nunca ingresar datos reales de pacientes.

## Objetivo de la demostración

Presentar el valor de EquilibraMind para dos públicos definidos:

- **Personas** (trabajadores y estudiantes): un recorrido fácil para reflexionar sobre el bienestar, revisar alternativas de acompañamiento, conocer precios y simular una cita.
- **Empresas** (áreas de talento humano y bienestar): presentar una propuesta preventiva, indicadores agregados de ejemplo y modelos de contratación B2B.

La plataforma utiliza Next.js y **IndexedDB**, una base local en cada navegador. No utiliza Supabase, pagos, videollamadas, historias clínicas ni cuentas reales.

## Antes de comenzar

1. Abrir https://equilibramind.vercel.app/ en Edge o Chrome actualizado.
2. Si la versión anterior está en caché, actualizar la pestaña sin caché.
3. Entrar en **Probar roles** y usar **Restablecer datos de la demo**. Confirmar.
4. Comprobar que hay tres personajes, tres profesionales y citas simuladas.
5. Revisar que las fotos no estén borrosas y que los controles sean legibles.

## Recorrido para personas: presentación sugerida de 4–6 minutos

1. **Inicio — propuesta de valor.** Explicar el problema del agotamiento, la prevención y la idea de un espacio de cuidado a un ritmo propio.
2. **Mi bienestar — chequeo orientativo.** Responder las seis preguntas. Aclarar que el instrumento no tiene validación clínica y no diagnostica burnout.
3. **Profesionales — explorar perfiles.** Filtrar por estrés laboral o vida estudiantil; abrir una ficha. Los profesionales y sus credenciales son ficticios y sus retratos generados con IA.
4. **Reservas — modalidad y precio.** Elegir un personaje de prueba, profesional, teleconsulta (COP 95.000) o presencial proyectada (COP 120.000), día y horario. Confirmar. Nada se cobra ni se agenda en la vida real.
5. **Mi espacio — persistencia local.** Mostrar la cita, cambiarla o cancelarla y repetir la prueba. Probar el ejercicio de respiración opcional de un minuto.
6. **Probar roles — consistencia.** Cambiar entre paciente, psicólogo y administrador. Comprobar que las reservas ficticias modifican la agenda y los indicadores locales.

Acceso rápido: desde **Inicio → Descubre cómo funciona, paso a paso** o **Ver recorrido** en la cabecera. Los botones **Siguiente paso**, **Atrás** y **Finalizar** permiten navegar sin perder el hilo.

## Recorrido empresarial: presentación sugerida de 3–5 minutos

1. **Inicio.** Presentar el problema de la sobrecarga y la necesidad de una cultura de cuidado; no afirmar resultados clínicos ni empresariales que el prototipo no ha medido.
2. **Para empresas.** Describir psicoeducación, programas y recursos proyectados.
3. **Panel empresarial.** Mostrar los porcentajes como simulaciones agregadas, nunca como resultados de clientes ni de pacientes reales.
4. **Planes.** Explicar las tres líneas: pago individual, suscripción mensual y propuesta B2B a medida, con precios ficticios.
5. **Probar roles — Administrador.** Mostrar métricas calculadas sobre las citas ficticias de IndexedDB. Restablecer los datos al terminar.

Acceso rápido: botón **Presentar propuesta B2B** de la sección empresarial o **Ver recorrido empresarial** en la portada.

## Comprobaciones funcionales v0.5

| Prueba | Resultado esperado |
|---|---|
| Menú hamburguesa en pantalla pequeña | Abre enlaces accesibles, se cierra al navegar o pulsar Escape |
| Accesos rápidos móviles | Inicio, Citas y Recorrido accesibles con el pulgar |
| Salto al contenido | Aparece al navegar con Tab y enfoca el contenido principal |
| Recorrido personal | Los pasos cambian de sección y dirigen a profesionales/reserva |
| Recorrido empresarial | El paso de indicadores abre el panel empresarial ficticio |
| Chequeo | Seis preguntas, progreso visible, resultado no diagnóstico |
| Resultado del chequeo | Puede avanzar a profesionales o consultar precios |
| Reserva | Modalidad, hora y fecha válidas; el precio aparece antes de confirmar |
| IndexedDB | La cita sigue disponible después de recargar en ese navegador |
| Cancelación | La reserva desaparece de paciente/profesional y cambia el conteo de admin |
| Roles | Las vistas comparten la misma base local, no son cuentas autenticadas |
| Restablecimiento | Recupera los datos ficticios iniciales |
| Movimiento reducido | El sitio es usable sin animaciones de entrada |
| Fotos | Se ven nítidas en móvil y computador, identificando el contenido de IA |

**Limitaciones conocidas:** los datos no se sincronizan entre dispositivos; el menú de roles no protege ni autentica; no hay pago, proveedor real, disponibilidad clínica ni videollamada. Para una eventual comercialización se necesitan profesionales habilitados, supervisión clínica y jurídica, consentimiento informado, gestión de incidentes, privacidad y un backend con controles de acceso reales.

## Próximo paso propuesto: v0.6

Priorizar una revisión manual en móvil real, corregir cualquier falla de navegación o almacenamiento detectada y preparar una demostración académica reproducible y pruebas de aceptación. Solo plantear cuentas y persistencia remota cuando se defina operar con datos verdaderos.
