<script lang="ts">
	import { resolve } from '$app/paths';
	import { useGameState } from '#lib/state/game-state.svelte.ts';
	import { level } from '#lib/game/scoring.ts';
	import { calculateMastery, accuracy } from '#lib/game/mastery.ts';
	import { GAME_CONFIG, appConfig } from '#lib/config/app.ts';
	import { es } from '#lib/copy/es.ts';
	import ProgressBar from '#lib/components/ProgressBar.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	const game = useGameState();
	let confirmReset = $state(false);
	let resetMessage = $state('');
	const values = $derived(
		[...(game.dataset.content?.values ?? [])].sort(
			(a, b) =>
				(game.progress.conceptProgress[b.id]?.attempts ?? 0) -
					(game.progress.conceptProgress[a.id]?.attempts ?? 0) || a.name.localeCompare(b.name, 'es')
		)
	);
	function reset() {
		resetMessage = game.reset()
			? 'Tu progreso se ha reiniciado.'
			: 'No se pudo borrar el progreso. Revisa los permisos de almacenamiento de tu navegador.';
		confirmReset = false;
	}
</script>

<svelte:head><title>Tu progreso · {appConfig.name}</title></svelte:head>
<section class="progress-intro">
	<div>
		<p class="eyebrow">PEQUEÑOS PASOS, IDEAS MÁS CLARAS</p>
		<h1>Tu progreso<span class="accent">.</span></h1>
		<p class="muted">Aprender no es acertar siempre. Es entender un poco más.</p>
	</div>
	<a class="secondary" href={resolve('/')}>Seguir practicando ↗</a>
</section>
{#if !game.progress.questionsAnswered}<div class="notice">
		<strong>Aún tienes todo por descubrir.</strong> Empieza tu primera partida para ver cómo avanzas.
	</div>{/if}
<div class="stats-grid">
	<div class="stat featured-stat">
		<span>Nivel global</span><strong>{level(game.progress.totalXp)}</strong><ProgressBar
			value={game.progress.totalXp % GAME_CONFIG.xpPerLevel}
			max={GAME_CONFIG.xpPerLevel}
			label="XP hacia el siguiente nivel"
		/><small
			>{GAME_CONFIG.xpPerLevel - (game.progress.totalXp % GAME_CONFIG.xpPerLevel)} XP para el siguiente
			nivel</small
		>
	</div>
	<div class="stat">
		<span>XP total</span><strong data-testid="total-xp">{game.progress.totalXp}</strong>
	</div>
	<div class="stat">
		<span>Partidas completadas</span><strong data-testid="games-played"
			>{game.progress.gamesPlayed}</strong
		>
	</div>
	<div class="stat">
		<span>Preguntas respondidas</span><strong>{game.progress.questionsAnswered}</strong>
	</div>
	<div class="stat">
		<span>Aciertos globales</span><strong
			>{accuracy(game.progress.correctAnswers, game.progress.questionsAnswered)}<small>
				%</small
			></strong
		><small
			>{game.progress.correctAnswers} correctas · {game.progress.incorrectAnswers} por aprender</small
		>
	</div>
	<div class="stat"><span>{es.bestStreak}</span><strong>{game.progress.bestStreak}</strong></div>
</div>
<div class="section-heading">
	<h2>Dominio por valor</h2>
	<span class="muted">{values.length} conceptos para explorar</span>
</div>
<div class="mastery-grid">
	{#each values as value (value.id)}{@const concept =
			game.progress.conceptProgress[value.id]}{@const mastery = calculateMastery(concept)}
		<article class="mastery-item">
			<div class="mastery-heading">
				<h3>{value.name}</h3>
				<span class="mastery-status" class:mastered={mastery.status === 'Dominado'}
					>{mastery.status}</span
				>
			</div>
			<p>{value.shortDefinition}</p>
			<ProgressBar value={mastery.percent} label={`Aciertos en ${value.name}`} />
			<div class="mastery-numbers">
				<span>{concept?.correct ?? 0} / {concept?.attempts ?? 0} correctas</span><strong
					>{mastery.percent} %</strong
				>
			</div>
		</article>{/each}
</div>
<section class="reset-section">
	<div>
		<h2>Un nuevo comienzo</h2>
		<p class="muted">El progreso se guarda solo en este navegador.</p>
	</div>
	<button class="ghost danger-text" onclick={() => (confirmReset = true)}>{es.reset}</button>
</section>
{#if resetMessage}<p role="status">{resetMessage}</p>{/if}
{#if confirmReset}<ConfirmDialog
		title={es.resetTitle}
		description={es.resetDescription}
		confirmLabel={es.erase}
		onconfirm={reset}
		oncancel={() => (confirmReset = false)}
	/>{/if}
