import { self } from '$app/service-worker';
import { version } from '$app/env';
import { immutable, assets, prerendered } from '$app/manifest';
const PREFIX = 'principios-offline-';
const CACHE = `${PREFIX}${version}`;
const paths = new Set<string>(
	[...immutable, ...assets, ...prerendered].map(
		(file) => new URL(file.path, self.registration.scope).pathname
	)
);
self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...paths])));
});
self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			await Promise.all(
				(await caches.keys())
					.filter((key) => key.startsWith(PREFIX) && key !== CACHE)
					.map((key) => caches.delete(key))
			);
			await self.clients.claim();
		})()
	);
});
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
	// Las query strings seleccionan la partida en cliente; el documento cacheado es el mismo.
	let pathname = url.pathname;
	if (event.request.mode === 'navigate' && !pathname.endsWith('/') && paths.has(pathname + '/'))
		pathname += '/';
	if (!paths.has(pathname)) return;
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			const cached = await cache.match(pathname);
			return cached ?? fetch(event.request);
		})()
	);
});
