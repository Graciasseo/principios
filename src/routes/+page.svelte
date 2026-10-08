<script lang="ts">
	import { resolve } from '$app/paths';
	import { appConfig, GAME_CONFIG } from '#lib/config/app.ts';
	import { modes, difficulties, es } from '#lib/copy/es.ts';
	import { useGameState } from '#lib/state/game-state.svelte.ts';
	import { level } from '#lib/game/scoring.ts';
	import type { GameMode } from '#lib/types/game.ts';
	import { parseDifficulty } from '#lib/game/difficulty.ts';
	import ModeCard from '#lib/components/ModeCard.svelte';
	const game = useGameState();
	let selected = $state<GameMode>('valor-principio');
</script>

<svelte:head><title>{appConfig.name} — Aprende valores y principios jugando</title></svelte:head>
<section class="home-intro">
	<div>
		<p class="eyebrow"><span class="tiny-dot"></span>{es.sectionLabel}</p>
		<h1>Lo que valoras.<br /><span>Cómo actúas.</span></h1>
		<p class="intro-text">{appConfig.tagline}</p>
	</div>
	<aside class="intro-note">
		<span class="note-symbol" aria-hidden="true">↗</span>
		<p>Las buenas decisiones<br />se pueden practicar.</p>
		<span class="muted">10 preguntas. Un paso más.</span>
	</aside>
</section>
<section class="play-setup" aria-labelledby="modes-heading">
	<div class="section-heading">
		<h2 id="modes-heading">{es.mode}</h2>
		<span class="muted">01 — 04</span>
	</div>
	<div class="mode-grid">
		{#each modes as mode, index (mode.id)}<ModeCard
				{mode}
				number={index + 1}
				selected={selected === mode.id}
				onclick={() => (selected = mode.id)}
			/>{/each}
	</div>
	<div class="start-row">
		<div class="difficulty-control">
			<label for="difficulty">{es.difficulty}</label><select
				id="difficulty"
				value={game.progress.selectedDifficulty}
				onchange={(event) => game.setDifficulty(parseDifficulty(event.currentTarget.value))}
				>{#each difficulties as difficulty, index (difficulty)}<option value={index + 1}
						>{difficulty}</option
					>{/each}</select
			><span class="difficulty-note"
				>{selected === 'valor-principio'
					? '2 categorías · conceptos de dificultad creciente'
					: `${Math.min(game.progress.selectedDifficulty + 1, 4)} opciones · ${game.progress.selectedDifficulty >= 3 ? 'conceptos cercanos' : 'paso a paso'}`}</span
			>
		</div>
		<a
			class="primary start-button"
			href={`${resolve('/jugar')}?modo=${selected}&dificultad=${game.progress.selectedDifficulty}`}
			>{es.play}<span aria-hidden="true">→</span></a
		>
	</div>
	<div class="session-note">
		<span
			>{GAME_CONFIG.questionsPerSession} preguntas por partida <span aria-hidden="true">·</span> Sin límite
			de tiempo</span
		><span
			>{game.progress.questionsAnswered
				? `Nivel ${level(game.progress.totalXp)} · ${game.progress.totalXp} XP · Mejor racha ${game.progress.bestStreak}`
				: es.first}</span
		>
	</div>
</section>
<section class="foundation" aria-labelledby="foundation-heading">
	<div>
		<p class="eyebrow">LA DIFERENCIA ES PEQUEÑA. EL CAMBIO, GRANDE.</p>
		<h2 id="foundation-heading">{es.foundationTitle}</h2>
	</div>
	<div class="foundation-definitions">
		<p><strong>Valor</strong><span>{es.foundationValue}</span></p>
		<span class="definition-arrow" aria-hidden="true">→</span>
		<p><strong>Principio</strong><span>{es.foundationPrinciple}</span></p>
	</div>
</section>
