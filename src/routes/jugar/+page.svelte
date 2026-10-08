<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useGameState } from '#lib/state/game-state.svelte.ts';
	import { parseMode } from '#lib/game/generator.ts';
	import { parseDifficulty } from '#lib/game/difficulty.ts';
	import { level } from '#lib/game/scoring.ts';
	import { accuracy } from '#lib/game/mastery.ts';
	import { appConfig } from '#lib/config/app.ts';
	import { modes, difficulties, es } from '#lib/copy/es.ts';
	import ProgressBar from '#lib/components/ProgressBar.svelte';
	import QuestionCard from '#lib/components/QuestionCard.svelte';
	import AnswerOption from '#lib/components/AnswerOption.svelte';
	import FeedbackPanel from '#lib/components/FeedbackPanel.svelte';
	const game = useGameState();
	const session = $derived(game.session);
	const question = $derived(session?.questions[session.index]);
	const answer = $derived(session?.answers[session.index]);
	const strong = $derived(
		Object.entries(session?.result.conceptResults ?? {}).filter(
			([, p]) => p.attempts >= 2 && p.correct / p.attempts >= 0.8
		)
	);
	const practice = $derived(
		Object.entries(session?.result.conceptResults ?? {}).filter(
			([, p]) => p.attempts >= 2 && p.incorrect > 0
		)
	);
	const valueName = (id: string) =>
		game.dataset.content?.values.find((v) => v.id === id)?.name ?? id;
	function start() {
		game.start(
			parseMode(page.url.searchParams.get('modo')),
			parseDifficulty(page.url.searchParams.get('dificultad') ?? game.progress.selectedDifficulty)
		);
	}
	onMount(start);
	beforeNavigate((navigation) => {
		if (game.session && game.session.phase !== 'RESULT' && game.session.answers.length > 0) {
			if (navigation.willUnload) navigation.cancel();
			else if (!window.confirm(`${es.exitTitle}\n${es.exitDescription}`)) navigation.cancel();
		}
	});
	async function next() {
		game.next();
		await tick();
		document
			.getElementById(session?.phase === 'RESULT' ? 'result-title' : 'question-title')
			?.focus();
	}
	async function respond(id: string) {
		game.answer(id);
		await tick();
		document.getElementById('continue')?.focus({ preventScroll: true });
	}
	async function again() {
		start();
		await tick();
		document.getElementById('question-title')?.focus();
	}
	function keyboard(event: KeyboardEvent) {
		if (
			event.repeat ||
			event.ctrlKey ||
			event.altKey ||
			event.metaKey ||
			event.shiftKey ||
			!session
		)
			return;
		if (
			event.target instanceof HTMLElement &&
			(event.target.isContentEditable ||
				event.target.closest('input,textarea,select,[role="textbox"],dialog'))
		)
			return;
		if (session.phase === 'QUESTION' && /^[1-4]$/.test(event.key)) {
			const option = question?.options[Number(event.key) - 1];
			if (option) {
				event.preventDefault();
				void respond(option.id);
			}
		} else if (session.phase === 'ANSWERED' && event.key === 'Enter') {
			if (
				event.target instanceof HTMLElement &&
				event.target.closest('a,button') &&
				event.target.id !== 'continue'
			)
				return;
			event.preventDefault();
			void next();
		}
	}
</script>

<svelte:head><title>Jugar · {appConfig.name}</title></svelte:head>
<svelte:window onkeydown={keyboard} />
<div class="game-page">
	{#if game.error}<section class="empty-state">
			<h1>No pudimos preparar el juego</h1>
			<p>{game.error}</p>
			<a class="primary" href={resolve('/')}>{es.back}</a>
		</section>
	{:else if session && question}
		{#if session.phase === 'RESULT'}
			<section class="result-intro">
				<span class="result-symbol" aria-hidden="true">✳</span>
				<p class="eyebrow">{es.completed}</p>
				<h1 id="result-title" tabindex="-1">Cada decisión cuenta.</h1>
				<p>Una partida más para acercar tus ideas a tus acciones.</p>
			</section>
			<div class="result-score">
				<strong>{session.result.correct}<span> / {session.result.questions}</span></strong><span
					>{accuracy(session.result.correct, session.result.questions)} % de aciertos</span
				>
			</div>
			<div class="result-stats">
				<div>
					<strong>+{session.result.xpEarned} XP</strong><span>Ganados en esta partida</span>
				</div>
				<div>
					<strong>{session.result.bestStreak}</strong><span>{es.bestStreak} en la partida</span>
				</div>
			</div>
			<div class="result-learning">
				<section>
					<h2>{es.mastered}</h2>
					{#if strong.length}<ul>
							{#each strong as [id, p] (id)}<li>
									{valueName(id)} <span>{p.correct}/{p.attempts}</span>
								</li>{/each}
						</ul>{:else}<p>{es.insufficient}</p>{/if}
				</section>
				<section>
					<h2>{es.practice}</h2>
					{#if practice.length}<ul>
							{#each practice as [id, p] (id)}<li>
									{valueName(id)} <span>{p.correct}/{p.attempts}</span>
								</li>{/each}
						</ul>{:else}<p>{es.insufficient}</p>{/if}
				</section>
			</div>
			<div class="button-row result-actions">
				<button class="primary" onclick={again}>{es.again} <span aria-hidden="true">↗</span></button
				><a class="secondary" href={resolve('/')}>{es.back}</a><a
					class="ghost"
					href={resolve('/progreso')}>{es.progress} →</a
				>
			</div>
		{:else}
			<div class="game-top">
				<a class="ghost" href={resolve('/')} aria-label="Salir de la partida">← {es.exit}</a><span
					>{modes.find((m) => m.id === session.mode)?.name}
					<span class="muted">· {difficulties[session.difficulty - 1]}</span></span
				>
			</div>
			<div class="question-progress">
				<span>{es.question} {session.index + 1} de {session.questions.length}</span><span
					>{session.answers.length} completadas</span
				>
			</div>
			<ProgressBar
				value={session.answers.length}
				max={session.questions.length}
				label="Preguntas completadas"
			/>
			<div class="game-stats">
				<span>{es.level} {level(game.progress.totalXp)}</span><span data-testid="xp"
					>{game.progress.totalXp} XP</span
				><span><span aria-hidden="true">↗ </span>{es.streak} {game.progress.currentStreak}</span>
			</div>
			{#key question.id}
				<div class="question-transition">
					<QuestionCard {question} />
					<div class="answers" class:long-answers={question.mode === 'valor-principio-regla'}>
						{#each question.options as option, index (option.id)}<AnswerOption
								{option}
								{index}
								answered={session.phase === 'ANSWERED'}
								correct={option.id === question.correctId}
								selected={answer?.optionId === option.id}
								onclick={() => respond(option.id)}
							/>{/each}
					</div>
					{#if answer}<FeedbackPanel {question} {answer} />
						<div class="continue-row">
							<span class="keyboard-hint">Enter para continuar</span><button
								id="continue"
								class="primary"
								onclick={next}
								>{session.index === session.questions.length - 1 ? es.results : es.continue}<span
									aria-hidden="true">→</span
								></button
							>
						</div>{:else}<p class="question-hint">
							Elige una respuesta. Aquí, equivocarse también es aprender.<span class="keyboard-hint"
								>Usa las teclas 1–{question.options.length}</span
							>
						</p>{/if}
				</div>
			{/key}
		{/if}
	{:else}<p class="empty-state" role="status">Preparando tu partida…</p>{/if}
</div>
