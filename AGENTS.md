# Objetivo

Juego educativo de valores y principios: pequeño, rápido, accesible y sin backend.

## Arquitectura

- `src/lib/components`: interfaz y comportamiento de interacción.
- `src/lib/game`: lógica TypeScript pura; recibe contenido, progreso y fuente aleatoria.
- `src/lib/content`: datos JSON y validación.
- `src/lib/storage`: persistencia local versionada y segura.
- `src/lib/state`: estado Svelte por contexto; conecta motor y almacenamiento solo en cliente.
- `src/lib/copy/es.ts`: textos de interfaz; `config/app.ts`: marca y constantes.

## Reglas

No poner contenido educativo en componentes. No acceder a LocalStorage desde la UI. No mover scoring a componentes. No hacer fetch del contenido local. No añadir servicios externos, backend, IA ni dependencias de interfaz. No ejecutar JSON ni usar `{@html}` con él.

SvelteKit 3: configuración en `vite.config.ts`, imports `#lib` con extensión, `$app/env` y service worker tipado con su propio tsconfig. Mantener TypeScript estricto y componentes con runes de Svelte 5.

## Antes de finalizar cualquier cambio

Ejecutar `npm run check`, `npm run lint`, `npm run test:unit`, `npm run build`. Para cambios de interfaz, rutas, persistencia o PWA: ejecutar también `npm run test:e2e` contra producción. Instalar Chromium con `npx playwright install chromium` si falta. Mantener el lockfile y documentación actualizados.

## Al ampliar contenido

Consultar primero `docs/CONTENT-GUIDE.md`. Mantener variedad de ámbitos humanos: el catálogo no debe centrarse únicamente en emprendimiento, trabajo o productividad. Revisar el catálogo existente y no añadir un valor si ya está cubierto adecuadamente. Comprobar diferencias con conceptos cercanos, principales y secundarios defendibles, y diversidad de contextos dentro de cada valor. Conservar IDs y significado del progreso histórico.

Las reflexiones son preguntas opcionales; no diagnostican ni deducen propósito, misión o visión a partir de aciertos. No añadirlas automáticamente al feedback. Ejecutar los tests de integridad y del generador, además de los checks anteriores; para ampliaciones de contenido jugable ejecutar E2E sobre el build actualizado.
