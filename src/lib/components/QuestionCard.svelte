<script lang="ts">
	import type { Question } from '../types/game.ts';
	import { prompts } from '../copy/es.ts';
	let { question }: { question: Question } = $props();
</script>

<section class="question-card" aria-labelledby="question-title">
	<p class="eyebrow">{prompts[question.mode]}</p>
	<h1 id="question-title" tabindex="-1">{question.prompt}</h1>
</section>
