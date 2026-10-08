<script lang="ts">
	import type { Question, Answer } from '../types/game.ts';
	import { es } from '../copy/es.ts';
	import { calculateScore } from '../game/scoring.ts';
	let { question, answer }: { question: Question; answer: Answer } = $props();
</script>

<section
	class="feedback"
	class:feedback-incorrect={!answer.correct}
	role="status"
	aria-live="polite"
	aria-atomic="true"
>
	<div class="feedback-heading">
		<h2>{answer.correct ? '✓ ' + es.correct : '↳ ' + es.incorrect}</h2>
		<span class="xp-earned">+{calculateScore(answer.correct)} XP</span>
	</div>
	{#if !answer.correct}<p class="answer-detail">
			{es.selected}: {question.options.find((o) => o.id === answer.optionId)?.label}
		</p>{/if}
	<p class="answer-detail">
		<strong>{es.answer}: {question.options.find((o) => o.id === question.correctId)?.label}</strong>
	</p>
	<p>{question.explanation}</p>
</section>
