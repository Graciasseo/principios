<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>No se pudo abrir la página</title></svelte:head>
<section class="empty-state">
	<p class="eyebrow">{page.status}</p>
	<h1>No pudimos abrir esta página.</h1>
	<p>Vuelve al inicio para seguir aprendiendo.</p>
	<a class="primary" href={resolve('/')}>Volver al inicio</a>
</section>
