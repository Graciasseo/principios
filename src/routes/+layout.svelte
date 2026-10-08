<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { asset } from '$app/paths';
	import { provideGameState } from '#lib/state/game-state.svelte.ts';
	import { appConfig } from '#lib/config/app.ts';
	import { es } from '#lib/copy/es.ts';
	import AppHeader from '#lib/components/AppHeader.svelte';
	let { children } = $props();
	const game = provideGameState();
	onMount(() => game.init());
</script>

<svelte:head>
	<meta name="description" content={appConfig.description} />
	<meta name="theme-color" content="#254f42" />
	<link rel="icon" href={asset('favicon.svg')} type="image/svg+xml" />
	<link rel="manifest" href={asset('manifest.webmanifest')} />
	<link rel="apple-touch-icon" href={asset('icons/icon-192.png')} />
</svelte:head>
<a href="#contenido" class="skip-link">Saltar al contenido</a>
<div class="app-shell">
	<AppHeader />
	<main id="contenido">
		{#if !game.storageAvailable}<p class="notice" role="status">{es.storageWarning}</p>{/if}
		{@render children()}
	</main>
	<footer class="site-footer">
		<span class="footer-mark" aria-hidden="true">◈</span><span>{es.privacy}</span><span
			class="footer-note">Hecho para aprender.</span
		>
	</footer>
</div>
