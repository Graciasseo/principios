# Guía de contenido de Principios

El juego enseña a distinguir valores y principios y a relacionarlos. El autoconocimiento es una posibilidad de reflexión posterior, no una evaluación psicológica ni un nuevo criterio de puntuación.

## Valor, principio y otras categorías

Un **valor** expresa algo que consideramos importante y que orienta decisiones. Un **principio** propone una forma práctica de decidir o actuar para concretarlo. La palabra «honestidad» nombra un valor; «Cuando no sé una respuesta, lo reconozco en lugar de inventarla» concreta una regla.

Un objetivo es un resultado (comprar una casa); una habilidad, una capacidad específica (programar); una emoción, una experiencia (alegría). No se convierten automáticamente en valores. «Duerme ocho horas» es una recomendación; «Procuro atender mi necesidad de descanso en vez de ignorarla sistemáticamente» propone un criterio de cuidado. No utilizar reglas como prescripciones médicas.

## Escribir y revisar

1. Leer el catálogo completo antes de añadir un valor: comprobar si ya existe el concepto, aunque tenga otro nombre.
2. Definir el foco del valor en una frase y explicar qué lo distingue de sus vecinos. No inflar el catálogo con sinónimos.
3. Escribir una situación imaginable y una orientación aplicable. Evitar «soy buena persona», declaraciones de admiración o promesas de éxito.
4. Elegir un valor principal defendible desde el texto, no únicamente desde la explicación posterior. Si hay dos respuestas igual de defendibles, revisar el texto antes de publicarlo.
5. Añadir secundarios pertinentes y explicar el matiz. No llenar `relatedValueIds` con todas las relaciones posibles.
6. Variar contextos dentro de cada valor: persona, relaciones, familia, amistad, aprendizaje, conflicto, comunidad, adversidad, recursos y futuro. Trabajo y proyectos son parte de la vida, no su centro.
7. Revisar dificultad por la distinción conceptual exigida, no por longitud o vocabulario.
8. Revisar posibles tensiones: lealtad no exige encubrir; transparencia no elimina privacidad; perseverancia admite dejar metas que ya no tienen sentido; cuidado no exige agotarse.

Español natural, adulto y directo. Preferir frases que no necesiten especificar género. Usar «cuando», «si», «procuro» o «intento» donde aporten contexto; no añadirlos mecánicamente. Evitar absolutos innecesarios, lenguaje corporativo, grandilocuente, clínico o espiritualista por defecto.

Los principios son ejemplos pedagógicos, no mandamientos universales. Acertar identifica el concepto principal de una frase; no demuestra que ese valor sea prioritario en la vida del jugador.

## Archivos y compatibilidad

- `src/lib/content/values.json`: valores, definiciones, conceptos confundibles y metadatos.
- `src/lib/content/principles.json`: reglas, relaciones, explicaciones y metadatos.
- `src/lib/types/content.ts`: contratos y nueve dimensiones admitidas.
- `src/lib/content/loader.ts`: validación de ambas listas.

Los IDs se escriben en minúsculas sin acentos, con dígitos o guiones. Son estables y no se cambian por ajustes de redacción. El progreso guarda IDs de valores; no reutilizar uno para un concepto distinto. La ampliación mantiene los 12 valores y los 48 IDs de principios originales. No requiere migrar el esquema de progreso, que sigue en versión 1.

`dimensions`, `reflection`, `tags` y `packId` son opcionales en ambos tipos. Los registros antiguos sin ellos siguen siendo válidos. Si un campo opcional no aporta información, omitirlo en lugar de usar `null` o una lista vacía. Añadir contenido sigue requiriendo solo JSON; actualizar la expectativa editorial de cantidades en los tests cuando cambie el catálogo.

## Relaciones

| Campo             | Significado                                      | Criterio de uso                                               |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| `primaryValueId`  | Foco que corrige el ejercicio                    | Debe ser defendible en el enunciado y existir en values       |
| `relatedValueIds` | Valores secundarios reales                       | No incluir al principal ni usarlo como lista de sinónimos     |
| `confusableWith`  | Vecinos que alguien podría confundir al aprender | No significa equivalencia; revisar la explicación comparativa |

En nivel 1–2 el generador excluye secundarios como distractores en principio → valor. En niveles 3–4 pueden aparecer, por lo que el matiz debe estar claro. En valor → principio nunca se elige como distractor una regla que incluya el valor preguntado como secundario. Las relaciones de confusión son dirigidas: pueden ser recíprocas si es útil, pero no es obligatorio.

## Diferencias conceptuales del catálogo

| Grupo                                                               | Focos que hay que distinguir                                                                                                                 |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Honestidad / Transparencia / Integridad / Coherencia / Autenticidad | No engañar / hacer visible lo relevante / sostener criterios éticos / alinear pensamiento, palabras y actos / expresar la propia experiencia |
| Libertad / Autonomía / Confianza                                    | Poder elegir sin imposiciones / tener criterio y capacidad propios / dar margen a otra persona aceptando cierta vulnerabilidad               |
| Empatía / Compasión / Respeto / Tolerancia / Cuidado                | Comprender / aliviar sufrimiento / reconocer dignidad y límites / convivir con diferencias / atender necesidades y sostener bienestar        |
| Disciplina / Perseverancia / Compromiso / Responsabilidad           | Regularidad / continuar ante obstáculos / sostener una implicación elegida / hacerse cargo de obligaciones y consecuencias                   |
| Humildad / Prudencia / Paciencia                                    | Reconocer límites / considerar riesgo e incertidumbre / dar tiempo sin precipitar por incomodidad                                            |
| Generosidad / Contribución / Colaboración / Solidaridad             | Compartir lo propio / aportar utilidad más allá de uno / construir en común / sostener apoyo ante necesidades compartidas                    |
| Lealtad / Justicia / Integridad                                     | Sostener vínculos / usar criterios equitativos / mantener límites éticos; el vínculo no exige justificar daños                               |
| Transparencia / Privacidad                                          | Informar sobre lo pertinente / proteger lo íntimo o innecesario para la decisión                                                             |
| Equilibrio / Cuidado                                                | Repartir atención entre ámbitos / atender una necesidad concreta                                                                             |
| Curiosidad / Creatividad / Excelencia                               | Comprender / abrir posibilidades / mejorar calidad                                                                                           |

**Decisiones contra duplicaciones:** independencia no se añade como valor separado porque autonomía ya incluye reducir dependencias prácticas. Esto no afirma que ambos términos sean equivalentes en toda teoría: es una decisión editorial para este juego. Sencillez se cubre con simplicidad. Autocuidado se incluye en cuidado aplicado a `self`; servicio, en ejemplos de contribución. Aprendizaje es un contexto, presente en curiosidad y excelencia, no un objetivo profesional exclusivo.

## Dificultad

- **1:** relación directa, accesible sin comparar varios matices.
- **2:** requiere comprender el significado, con una situación algo menos directa.
- **3:** hay un concepto cercano plausible que se distingue por el foco.
- **4:** una distinción real organiza la pregunta: por ejemplo, ofrecer alivio sin comprender del todo (compasión frente a empatía), o mantener regularidad sin un revés concreto (disciplina frente a perseverancia).

No hace falta un ejemplo de cada dificultad por valor. Sí al menos un principio inicial para jugar desde nivel 1. El validador exige dos principios por valor; el criterio editorial del catálogo exige de tres a cinco, con contextos diversos. Actualmente hay cuatro por valor. No crear preguntas difíciles mediante trampas o falta de contexto.

## Dimensiones

Clasificación ligera, no categorías de personalidad. Un registro puede tener varias dimensiones; usar solo las pertinentes. Las dimensiones de un principio describen su situación concreta, no se heredan indiscriminadamente del valor.

| ID              | Lectura                                                                        |
| --------------- | ------------------------------------------------------------------------------ |
| `identity`      | Quién quiero ser y qué criterios siento propios                                |
| `self`          | Cómo me relaciono conmigo y atiendo mis necesidades                            |
| `relationships` | Cómo me relaciono con otras personas                                           |
| `decisions`     | Cómo tomo decisiones                                                           |
| `growth`        | Aprendizaje, cambio, dificultades y desarrollo                                 |
| `contribution`  | Qué aporto más allá de mí                                                      |
| `community`     | Convivencia y participación en grupos o entornos compartidos                   |
| `work`          | Tareas, proyectos y responsabilidades de trabajo; no equivale a emprendimiento |
| `future`        | Qué condiciones futuras me gustaría cuidar o construir                         |

No esconder ejemplos laborales bajo etiquetas generales para mejorar artificialmente el balance. Revisar tanto el texto como las etiquetas. El test editorial limita `work` a un máximo del 15 %; actualmente aparece en 9 de 136 principios (6,6 %). Las etiquetas pueden solaparse y sus porcentajes no suman 100 %.

## Reflexión, propósito, misión y visión

```ts
interface Reflection {
	purpose?: string[];
	mission?: string[];
	vision?: string[];
	questions?: string[];
}
```

- **Propósito (`purpose`):** por qué algo merece energía, atención o contribución. Puede tratar de cuidar, crear, acompañar, enseñar o proteger; no se restringe a una profesión.
- **Misión (`mission`):** cómo se intenta materializar un valor en el presente mediante acciones o prácticas.
- **Visión (`vision`):** qué futuro personal, familiar, comunitario o profesional se considera deseable.
- **Preguntas generales (`questions`):** exploran límites, elecciones o experiencias sin forzar una de las otras categorías.

Son pistas abiertas. Ningún valor se etiqueta como «valor de propósito»: cualquiera podría serlo para una persona. No usar «Tu propósito es…», «Eres una persona…», «Esto demuestra…» ni deducir identidad de aciertos. No diagnosticar, puntuar reflexiones ni prescribir respuestas. Una pregunta formalmente válida aún necesita revisión humana: empezar con «¿» no basta para que su contenido sea abierto.

Añadir solo preguntas que aporten algo específico. No generar cuatro bloques por registro ni copiar la misma pregunta en un valor y sus principios. El validador detecta repeticiones en todo el dataset, incluso entre categorías, normalizando mayúsculas y espacios. No hace análisis semántico. Si una pregunta debe reutilizarse en el futuro, referenciar la pregunta original mediante un diseño explícito, en lugar de copiarla silenciosamente.

**En esta iteración no se muestra `reflection` ni `dimensions` en el juego.** El feedback mantiene su explicación actual. No hay formulario, test de personalidad ni análisis de patrones. Las respuestas de aprendizaje tampoco registran preferencias o rechazos personales: para eso haría falta una experiencia futura con consentimiento y un modelo de datos distinto.

## Ejemplos reales

### Sencillo: responsabilidad

`responsabilidad-01`: «Si daño algo que me han prestado, me hago cargo de repararlo o reponerlo».

El foco principal es asumir la reparación. Honestidad es secundaria porque reconocer el hecho ayuda, pero admitirlo sin hacerse cargo no expresa todo el principio. Dimensión: `relationships`; dificultad 1.

### Cercanos: honestidad, transparencia e integridad

- Honestidad: reconocer que no se sabe una respuesta evita inventarla.
- Transparencia: explicar los costes de un gasto compartido permite decidir con información relevante.
- Integridad: rechazar participar en un engaño aunque se pierda una oportunidad sostiene un límite ético bajo presión.

Las tres pueden coincidir en una situación. La pregunta debe identificar qué foco se está ejercitando, sin afirmar exclusividad.

### Propósito: contribución

Fragmento de `contribucion` (el resto de campos obligatorios siguen en el JSON):

```json
{
	"reflection": {
		"purpose": [
			"¿Qué te gustaría que otras personas recibieran gracias a tu presencia o a lo que haces?"
		]
	}
}
```

No fija la respuesta ni presupone una ocupación.

### Misión: curiosidad

`curiosidad.reflection.mission`: «¿De qué forma podrías convertir tus preguntas en una práctica habitual?».

La regla `curiosidad-03` invita a explorar razones que contradicen una idea propia. La reflexión permite pensar cómo llevar esa actitud al presente; no se corrige como un examen.

### Visión: justicia

`justicia.reflection.vision`: «¿Cómo sería un entorno que consideraras más justo para quienes parten de situaciones diferentes?».

Abre un horizonte deseable sin imponer una única distribución de recursos o una identidad al usuario.

## Validación antes de entregar

Ejecutar `npm run check`, `npm run lint`, `npm run test:unit` y `npm run build`. Al ampliar relaciones jugables, ejecutar también `npm run test:e2e` sobre un build nuevo.

Los tests detectan IDs y referencias inválidos, nombres/textos duplicados, definiciones vacías, niveles inválidos, valores aislados, dimensiones desconocidas y reflexiones mal formadas o duplicadas. Además, simulan sesiones, prueban cada principio en ambos sentidos y comprueban que retirar los metadatos no cambia las preguntas generadas.

Completar una revisión editorial: los tests no demuestran por sí solos que una distinción sea buena, que un principio sea inequívoco o que una pregunta invite a reflexionar. Documentar las decisiones y revisar con personas reales antes de añadir complejidad.
