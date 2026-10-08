# Principios

Aprende a convertir lo que valoras en cómo actúas. Un juego educativo pequeño, sin backend, con 34 valores y 136 principios reales de comportamiento. Cuatro modos, diez preguntas por partida y explicaciones que reconocen relaciones secundarias entre valores.

## Ejecutar

Requisitos: Node.js **>=22.17** y npm. Verificado con Node 24.21 y npm 11.19; Docker y CI usan Node 24. Desde la carpeta `principios`:

```bash
npm ci
npm run dev
```

`npm install` también funciona; conservar `package-lock.json`. Desarrollo: http://localhost:5173. No hacen falta variables de entorno.

```bash
npm run build
npm run preview
```

Preview de producción: http://localhost:4173. El resultado desplegable está en `build/`.

## Stack y convenciones

SvelteKit 3.0.1, Svelte 5.57.2, TypeScript 6.0.3 estricto, Vite 8.3.3 y adapter-static 4.0.0. Versiones exactas de toda la cadena en el lockfile. CSS nativo y tipografías del sistema. Sin librerías de UI ni dependencias de runtime ajenas al framework.

Creado con el CLI oficial `sv create`, plantilla mínima y add-ons oficiales de static adapter, Prettier, ESLint, Vitest y Playwright. Se usan las [convenciones oficiales de SvelteKit 3](https://svelte.dev/docs/kit/migrating-to-sveltekit-3): configuración en `vite.config.ts`, imports `#lib` con extensión, `$app/env`, `$app/manifest`, `$app/service-worker` y tsconfig extendido desde `$app/tsconfig`. No existe `svelte.config.js` ni se han usado APIs legacy de Kit 2.

La máquina de estados usa `session = null` como READY, seguido de QUESTION → ANSWERED → QUESTION / RESULT. No permite dobles respuestas, avances sin respuesta ni dobles finales. Recargar empieza otra partida conservando lo ya ganado. Las rutas se prerenderizan con slash final (`/jugar/`, `/progreso/`); Nginx resuelve también sus versiones sin slash.

## Modos

- **¿Valor o principio?**: cinco nombres de valores y cinco reglas, en orden aleatorio.
- **Principio → Valor**: identificar el valor principal de una regla.
- **Valor → Principio**: elegir una regla que concrete el valor.
- **Reto mixto**: mezcla garantizada de los tres anteriores; recomendado después de aprender la base.

No hay límite de tiempo. +10 XP por acierto y +0 por error. Nivel global = `floor(totalXp / 100) + 1`, separado de la dificultad. Una respuesta correcta incrementa la racha; un error la reinicia. La mejor racha histórica y la de la partida se calculan por separado. Una partida se contabiliza como completada al abrir su resumen.

Teclas 1–4 para responder y Enter para continuar después del feedback. No se interceptan campos editables ni combinaciones con modificadores. Las opciones respondidas quedan bloqueadas, con marcas de texto además del color. El foco pasa a Continuar y a la siguiente pregunta. Reset usa un diálogo con foco y Escape; salir de una partida con respuestas solicita confirmación.

## Arquitectura

```text
principios/
├── src/
│   ├── lib/
│   │   ├── components/       # UI reutilizable y accesibilidad
│   │   ├── config/app.ts     # Marca, XP, sesiones y schema
│   │   ├── content/          # values.json, principles.json, validación
│   │   ├── copy/es.ts        # Textos generales y etiquetas de modos
│   │   ├── game/             # Motor puro, generator, scoring, mastery, random
│   │   ├── state/            # Runes Svelte por contexto, sin singleton SSR
│   │   ├── storage/          # Interfaz, LocalStorage y migraciones
│   │   └── types/            # Contratos de contenido, sesión y progreso
│   ├── routes/              # Inicio, jugar, progreso y error comprensible
│   ├── service-worker/      # Caché nativa, tsconfig independiente
│   └── app.css              # Tokens, layout, responsive y temas
├── static/                  # Manifest, favicon y PNG locales
├── tests/{unit,e2e}/
├── scripts/generate-icons.mjs
├── .github/workflows/ci.yml
├── Dockerfile
├── nginx.conf
├── AGENTS.md
├── PRODUCT.md
├── ROADMAP.md
└── LICENSE
```

Los componentes consumen `GameState`; solo el adaptador de almacenamiento accede a LocalStorage. El motor no importa Svelte, DOM ni storage. Recibe contenido y una fuente aleatoria inyectable. Los JSON se importan en el bundle; nunca se obtienen por fetch. La validación falla en tests y muestra una pantalla comprensible en cliente si el dataset no es utilizable.

## Contenido y ampliación

Editar solamente `src/lib/content/values.json` y `principles.json`. IDs estables en minúsculas, sin acentos y con guiones. Un principio tiene un valor principal para corregir el ejercicio y cero o más secundarios para explicar sus matices. `packId` y `tags` son opcionales; no hay selector de packs en V1.

Antes de editar, consultar [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md). Ejemplo real del catálogo (Curiosidad ya existe; no añadirlo de nuevo):

```json
{
	"id": "curiosidad",
	"name": "Curiosidad",
	"shortDefinition": "Querer comprender lo desconocido y revisar lo que doy por sabido.",
	"explanation": "La curiosidad lleva a preguntar y explorar. Humildad reconoce límites del conocimiento; creatividad produce posibilidades. La curiosidad puede motivar aprendizaje sin buscar utilidad inmediata.",
	"confusableWith": ["humildad", "creatividad", "excelencia"],
	"dimensions": ["growth", "self", "decisions"],
	"reflection": {
		"mission": ["¿De qué forma podrías convertir tus preguntas en una práctica habitual?"]
	}
}
```

Principio correspondiente:

```json
{
	"id": "curiosidad-01",
	"text": "Cuando encuentro una palabra que no comprendo, busco su significado en vez de pasar por alto la duda.",
	"primaryValueId": "curiosidad",
	"relatedValueIds": [],
	"explanation": "Una duda se convierte en una oportunidad de comprender algo nuevo.",
	"difficulty": 1,
	"dimensions": ["growth"]
}
```

Después: `npm run test:unit` y `npm run check`. Actualizar las cantidades esperadas en el test de integridad si cambia el tamaño editorial del dataset. El test detecta IDs repetidos, referencias como `autnomia`, dificultades inválidas, campos vacíos y referencias a sí mismo. El validador exige al menos dos principios por valor, uno de dificultad 1; el criterio editorial pide entre tres y cinco por valor; se requieren al menos cuatro valores. Mantener suficientes distractores compatibles en cada nivel; las simulaciones detectan conjuntos insuficientes.

Los campos opcionales `dimensions` y `reflection` enriquecen el contenido sin cambiar las mecánicas. Hay nueve dimensiones y 45 preguntas seleccionadas: 8 de propósito, 12 de misión, 7 de visión y 18 generales. Se conservan como metadatos, sin mostrarlas todavía ni deducir perfiles. La validación detecta dimensiones inválidas, reflexiones duplicadas y contenido repetido. El catálogo anterior tenía 12 valores y 48 principios; sus IDs se conservan y el progreso sigue usando schema 1.

Las explicaciones de niveles altos deben justificar el foco principal frente a valores próximos. En el modo inverso nunca se usan reglas que incluyan el valor preguntado como secundario, para evitar dos opciones defendibles.

## Dificultad y adaptación

Inicial: 2 opciones y preferencia por valores alejados. Intermedio: 3 opciones, hasta un concepto cercano al principio de la selección. Avanzado y Experto: 4 opciones, priorizando `confusableWith`; Experto habilita además principios con matices de nivel 4. Los principios seleccionados nunca superan la dificultad elegida. Clasificación siempre tiene dos categorías, pero cambia la complejidad del contenido.

En niveles 1–2 se excluyen secundarios como distractores. En 3–4 pueden aparecer en principio → valor, acompañados de explicaciones del foco principal y definición del valor. La correcta se baraja en los modos de relación. Clasificación conserva el orden familiar Valor/Principio, pero tiene cinco respuestas de cada categoría.

Adaptación: `1 + incorrect / attempts` (peso entre 1 y 2). Se reduce el peso de un valor ya visto en esa partida mediante `peso / (1 + 3 * apariciones)`. No se repite el mismo enunciado del mismo modo. Puede desactivarse en `GAME_CONFIG.adaptive`. No hay IA ni repetición espaciada compleja. La aleatoriedad entra por `RandomSource`; los tests utilizan semillas.

Dominio por valor: Nuevo (0), Aprendiendo (1–2 intentos), En práctica (3–4, o más con menos del 80 %), Dominado (5+ y al menos 80 %). El porcentaje se redondea al entero más próximo para mostrarlo. En el resumen se exige al menos dos respuestas de un concepto para mencionar fortalezas o práctica pendiente; se aclara cuando no hay evidencia suficiente.

## Persistencia y privacidad

Una única clave `principios-progress`; `schemaVersion: 1`. Se guarda inmediatamente al responder, cambiar dificultad y completar una partida. Fechas en ISO. Los contadores y referencias internas se validan al leer. Datos corruptos o versiones desconocidas devuelven el estado inicial. `migrations.ts` es el punto de entrada para futuras migraciones. Si el navegador bloquea el guardado, se puede jugar en memoria y se muestra un aviso. El reset solo confirma éxito cuando el navegador elimina la clave.

**La V1 no utiliza cuentas, cookies, tracking ni servicios externos.** No se transmite progreso fuera del dispositivo. No hay banner de cookies ni recursos remotos. Borrar los datos del navegador elimina el progreso. No hay sincronización entre dispositivos ni coordinación entre pestañas simultáneas: la última escritura prevalece.

## PWA y offline

Manifest standalone, iconos 192/512 y maskable, y service worker nativo de Kit 3. Tras completar la primera instalación, precachea assets, bundle y las tres rutas prerenderizadas. Las query strings de modo/dificultad no cambian el HTML guardado. Todo el contenido educativo viene en el bundle.

Cada build crea un nombre de caché versionado; la activación borra solo cachés antiguas de esta app. No se usa `skipWaiting`: una nueva versión espera a que se cierren las pestañas anteriores para evitar mezclar assets durante una partida. HTTPS (o localhost) es necesario. El navegador puede eliminar la caché por falta de espacio; offline no sustituye una instalación que haya terminado correctamente. No se activa en desarrollo.

Prueba manual: `npm run build && npm run preview`, abrir Inicio, esperar que Application → Service Workers muestre el worker activado, desconectar la red y abrir `/jugar/?modo=mixto&dificultad=3` y `/progreso/`, responder, recargar y comprobar XP. El test E2E automatiza este recorrido tras visitar **solo** Inicio. La opción de instalación depende del navegador; no hay botón específico.

Iconos incluidos en Git, generados desde `static/favicon.svg` con `node scripts/generate-icons.mjs` (requiere Chromium de Playwright solo durante desarrollo). Para cambiar marca: `src/lib/config/app.ts` y los metadatos del manifest; los componentes toman el nombre de la configuración. Colores, tipografía y radios: tokens de `src/app.css`. Tema oscuro automático y movimiento reducido.

## Calidad

```bash
npm run check       # Svelte, TypeScript y service worker
npm run lint        # Prettier + ESLint
npm run format
npm run test:unit   # Vitest, termina sin modo watch
npx playwright install chromium
npm run test:e2e    # Build y servidor aislado en puerto 4183
npm test           # Unitarios + E2E
npm run build
```

En Linux puede ser necesario `npx playwright install --with-deps chromium`. `PLAYWRIGHT_BROWSERS_PATH` permite usar otra carpeta de binarios. Los E2E incluyen los cuatro modos completos, feedback, XP tras recarga, reset cancelado/confirmado, teclado, salida, almacenamiento corrupto/bloqueado, layouts de 320/375/1280 px y offline sin solicitudes externas. Las pruebas unitarias incluyen 100 sesiones por combinación de modo/dificultad (1.600 partidas), simulaciones de adaptación y cobertura directa de cada principio en ambos sentidos. También se comprueba que los metadatos no cambian las preguntas ni su feedback.

CI ejecuta check, lint, unitarios, E2E y build en Node 24. Artefactos de Playwright y cobertura están ignorados. `test-results/` contiene capturas y trazas cuando falla un E2E.

## Despliegue en Coolify

### A. Dockerfile (recomendado)

Usar esta carpeta como raíz del repositorio o establecer `/principios` como directorio base si se sube la carpeta contenedora. Elegir build pack Dockerfile, ruta `Dockerfile`, puerto **80**, dominio con HTTPS. Sin variables ni volúmenes. El build multistage instala con `npm ci`, genera estáticos y los copia a Nginx Alpine; la imagen final no contiene Node. Healthcheck HTTP con el `wget` de Alpine.

Prueba local con Docker instalado:

```bash
docker build -t principios .
docker run --rm -p 8080:80 principios
```

Abrir http://localhost:8080. `nginx.conf` sirve las rutas prerenderizadas, habilita gzip y tipos MIME, revalida HTML/manifest/service worker y conserva caché larga solo en assets fingerprinted. Rutas inexistentes devuelven 404 en vez de servir un HTML de otra ruta. No necesita fallback de SPA.

### B. Static build

En el modo estático de Coolify configurar:

- Build: `npm ci && npm run build`
- Directorio publicado: `build`
- Runtime de build: Node >=22.17 (recomendado 24)
- Servir índices de directorio (`/jugar/index.html`, `/progreso/index.html`).
- No cachear `service-worker.js` a largo plazo; MIME JavaScript y HTTPS.

No hacen falta variables de entorno. La configuración de esta V1 asume despliegue en la raíz del dominio, no un subdirectorio. No se ha publicado una instancia externa ni se han configurado credenciales de Coolify.

## Límites de V1 y siguientes pasos

Sin cuentas, backend, reanudación ni exportación del historial. Progreso por navegador; varias pestañas pueden sobrescribir sus cambios. Las etiquetas de dominio describen rendimiento en estos ejercicios, no cualidades personales. Chromium está cubierto por E2E; conviene una revisión final en Safari/Firefox y lectores de pantalla antes de una publicación amplia. La instalación PWA varía por sistema. No se ha ejecutado la imagen Docker si el entorno no dispone de Docker.

Prioridad siguiente: sesiones con usuarios, revisión pedagógica del contenido y prueba en dispositivos reales; después ampliar contenido con los mismos JSON. Las fases futuras están en [ROADMAP.md](ROADMAP.md), la visión en [PRODUCT.md](PRODUCT.md) y las reglas para agentes en [AGENTS.md](AGENTS.md).

## Licencia

MIT. Véase [LICENSE](LICENSE).

El informe de la ampliación (12 → 34 valores, 48 → 136 principios) está en [docs/CONTENT-EXPANSION.md](docs/CONTENT-EXPANSION.md). Los E2E arrancan su propio servidor en 4183 y no reutilizan la vista previa de 4173.

## Publicar en GitHub Pages

Subir esta carpeta como raíz de un repositorio público, con rama `main`. En Settings → Pages, seleccionar **GitHub Actions** como origen. El workflow `Publicar juego` valida y publica `build/` en cada push a `main`; también puede ejecutarse manualmente desde Actions. La URL final aparece en el despliegue.

El workflow obtiene automáticamente la subruta del repositorio y la pasa como `BASE_PATH` al compilador. El manifest usa rutas relativas para instalar la PWA dentro de esa subruta. Sin `BASE_PATH`, el desarrollo local y Docker siguen sirviendo desde `/`. No hacen falta claves ni servicios de pago para el juego.
