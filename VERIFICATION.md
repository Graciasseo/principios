# Verificación de V1

Verificación actualizada: 8 de octubre de 2026. Entorno: Node 24.21.0, npm 11.19.0, Linux.

| Comprobación                              | Resultado                                                 |
| ----------------------------------------- | --------------------------------------------------------- |
| Instalación con npm y lockfile            | Correcta; creado con CLI oficial `sv`                     |
| `npm run dev`                             | Arranca en `127.0.0.1:5173`                               |
| `npm run check`                           | 0 errores y 0 advertencias; incluye el service worker     |
| `npm run lint`                            | Correcto: Prettier y ESLint                               |
| `npm run test:unit`                       | 103 pruebas, 4 archivos, todas pasan                      |
| `npm run test:e2e`                        | 15 pruebas Chromium, todas pasan                          |
| `npm run build`                           | Correcto; adapter-static genera `build/`                  |
| `npm run preview`                         | Arranca en `127.0.0.1:4173`                               |
| Inspección visual                         | Inicio escritorio/móvil, feedback móvil y progreso oscuro |
| Errores JavaScript en el recorrido visual | Ninguno                                                   |

Los tests del generador simulan 100 partidas por combinación de modo/dificultad (1.600 partidas y 16.000 preguntas), además de comprobar la adaptación. Los E2E cubren los cuatro modos hasta el resumen, persistencia, reset, teclado, salida y tres anchuras: 320, 375 y 1280 px.

El test offline visita solo Inicio, espera al service worker, desactiva red, abre Progreso y Juego, responde y regresa a Inicio. Pasa sin solicitudes a orígenes externos. El build incluye las tres rutas, los JSON dentro del bundle, manifest, iconos y worker.

Capturas locales reproducibles: arrancar preview y ejecutar `node scripts/visual-check.mjs`. Se guardan en `artifacts/` (ignorado por Git). En este entorno, los binarios de navegador están en `/tmp/principios-browsers`; se ejecutaron las pruebas con `PLAYWRIGHT_BROWSERS_PATH=/tmp/principios-browsers`. Esto no es necesario en una instalación normal de Playwright.

## Límites de esta verificación

No hay Docker instalado en este entorno: se entrega Dockerfile/Nginx, pero no se afirma haber construido o ejecutado la imagen. No se ha desplegado en una instancia de Coolify. No se han ejecutado E2E en Firefox/WebKit, pruebas con lector de pantalla ni instalación PWA en un dispositivo físico. El navegador de escritorio sí muestra y permite jugar a la aplicación local.

## Ampliación de contenido

34 valores y 136 principios, con 45 preguntas de reflexión preparadas en metadatos. Comprobaciones repetidas después de ampliar el catálogo: check, lint, unitarios, build y E2E. Los E2E ahora usan un servidor nuevo en 4183 para evitar reutilizar una preview con referencias antiguas a assets. El nuevo test conserva progreso schema 1 y comprueba los 34 valores. Las capturas visuales registradas arriba pertenecen a la V1; no se han modificado UI ni CSS en esta ampliación. Informe completo en `docs/CONTENT-EXPANSION.md`.
