# Informe de ampliación del contenido

Cierre: 8 de octubre de 2026. La iteración quedó interrumpida antes de documentar y verificar; se ha retomado y completado.

## Catálogo antes y después

| Indicador            | Antes | Ahora |
| -------------------- | ----: | ----: |
| Valores              |    12 |    34 |
| Principios           |    48 |   136 |
| Principios por valor |     4 |     4 |

Valores originales conservados: Honestidad, Integridad, Transparencia, Autonomía, Libertad, Responsabilidad, Coherencia, Simplicidad, Excelencia, Respeto, Empatía, Justicia. Sus IDs y los 48 IDs de principios originales siguen presentes. Las mejoras de redacción mantienen el valor principal correspondiente.

Nuevos valores (22): Autenticidad, Compasión, Compromiso, Colaboración, Confianza, Contribución, Coraje, Creatividad, Curiosidad, Disciplina, Equilibrio, Generosidad, Gratitud, Humildad, Lealtad, Paciencia, Perseverancia, Prudencia, Solidaridad, Tolerancia, Cuidado, Privacidad.

Independencia se cubre dentro de autonomía para no duplicar el foco ya existente de reducir dependencias. Sencillez continúa como simplicidad; autocuidado forma parte de cuidado aplicado a uno mismo. La decisión editorial se explica en la guía, sin afirmar que estas palabras sean equivalentes en cualquier marco conceptual.

## Grupos cercanos trabajados

- Honestidad, transparencia, integridad, coherencia y autenticidad.
- Libertad, autonomía y confianza; independencia integrada en autonomía.
- Empatía, compasión, respeto, tolerancia y cuidado.
- Disciplina, perseverancia, compromiso y responsabilidad.
- Humildad, prudencia y paciencia.
- Generosidad, contribución, colaboración y solidaridad.
- Lealtad, justicia e integridad.
- Transparencia y privacidad.
- Equilibrio y cuidado.
- Curiosidad, creatividad y excelencia.

Se revisaron definiciones, `confusableWith`, relaciones secundarias, enunciados y explicaciones. La dificultad responde al matiz conceptual, no a la longitud: 34 principios iniciales, 37 intermedios, 32 avanzados y 33 expertos. Se conservaron situaciones adecuadas y se diversificaron otras, especialmente autonomía, simplicidad y excelencia.

## Dimensiones y modelo

`PersonalDimension` admite `identity`, `self`, `relationships`, `decisions`, `growth`, `contribution`, `community`, `work` y `future`. Todas aparecen en el catálogo.

`Value` y `Principle` comparten `ContentMetadata`, con `dimensions?`, `reflection?`, `tags?` y `packId?`. `Reflection` tiene listas opcionales de preguntas de propósito, misión, visión y exploración general. Los campos nuevos son opcionales: los datos anteriores siguen siendo válidos. No cambia el esquema 1 del progreso, ni su almacenamiento.

Los 136 principios tienen dimensiones asignadas a sus situaciones concretas. Solo 9 (6,6 %) incluyen trabajo; predominan relaciones, decisiones, aprendizaje y comunidad. Las dimensiones se solapan, por lo que sus totales no suman 136.

## Reflexiones incluidas

| Categoría | En valores | En principios |  Total |
| --------- | ---------: | ------------: | -----: |
| Propósito |          8 |             0 |      8 |
| Misión    |          6 |             6 |     12 |
| Visión    |          7 |             0 |      7 |
| Generales |         12 |             6 |     18 |
| **Total** |     **33** |        **12** | **45** |

Son preguntas seleccionadas, no respuestas sobre la identidad de quien juega. Quedan preparadas en datos y no se muestran todavía. No hay autodiagnóstico, inferencia de preferencias, formulario ni nuevo modo. La experiencia visual, scoring, rachas, niveles y motor permanecen sin cambios.

## Tests y resultados

- `content-integrity.test.ts`: actualiza cantidades y valida dimensiones, reflexiones, duplicados, nombres, textos, definiciones, cobertura mínima, diversidad, baja presencia laboral y conservación de IDs anteriores. Admite datos sin los nuevos metadatos.
- `generator.test.ts`: mantiene las 1.600 partidas deterministas, adapta la expectativa de vecinos a listas de más de tres valores y pregunta cada principio en ambos sentidos y niveles elegibles. Verifica que retirar metadatos no modifica preguntas ni feedback.
- `game.spec.ts`: nuevo E2E que carga progreso del schema 1, muestra los 34 valores y comprueba que el feedback sigue sin reflexiones adicionales. Se mantienen los recorridos de los cuatro modos, persistencia, reset, teclado, móvil y offline.
- `playwright.config.ts`: pruebas en un servidor propio, puerto 4183, sin reutilizar una preview antigua. Se corrigió un fallo de infraestructura por assets 404 al reutilizar el servidor de ayer; el juego no necesitó cambios para resolverlo.

Resultado final: **103 tests unitarios y 15 E2E Chromium pasan**. `npm run check`: cero errores y advertencias. `npm run lint`: correcto. `npm run build`: correcto, con las tres rutas y service worker generados mediante adapter-static.

Se compararon los archivos de interfaz, CSS, motor, storage y estado con la copia previa a esta iteración: sin cambios. No se han tocado la partida ni los datos del navegador del usuario para probar; los E2E usan contextos aislados y progreso de prueba.

## Documentación

Creados `docs/CONTENT-GUIDE.md` y este informe. Actualizados `AGENTS.md`, `README.md`, `PRODUCT.md` y `VERIFICATION.md`. La guía incluye criterios de escritura, diferencias entre conceptos, uso de dimensiones/reflexiones y ejemplos de responsabilidad, honestidad/transparencia/integridad, contribución→propósito, curiosidad→misión y justicia→visión.

La comprobación automática no sustituye una revisión pedagógica con personas reales. No se añaden pruebas en otros navegadores, despliegue externo ni evaluación terapéutica en esta iteración.
