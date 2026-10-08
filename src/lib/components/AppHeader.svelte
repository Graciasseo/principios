<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { appConfig } from '../config/app.ts';
	import { es } from '../copy/es.ts';
</script>

<header class="site-header">
	<a class="brand" href={resolve('/')} aria-label={`${appConfig.name} · ${es.home}`}
		><span class="brand-symbol" aria-hidden="true"><i></i><i></i></span>{appConfig.name}<span
			class="brand-dot">.</span
		></a
	>
	<nav aria-label="Navegación principal">
		<a
			class:active={page.url.pathname === '/'}
			aria-current={page.url.pathname === '/' ? 'page' : undefined}
			href={resolve('/')}>{es.home}</a
		>
		<a
			class:active={page.url.pathname.startsWith('/progreso')}
			aria-current={page.url.pathname.startsWith('/progreso') ? 'page' : undefined}
			href={resolve('/progreso')}>{es.progress}<span aria-hidden="true"> ↗</span></a
		>
	</nav>
</header>
