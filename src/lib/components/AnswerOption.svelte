<script lang="ts">
	import type { Option } from '../types/game.ts';
	let {
		option,
		index,
		answered,
		correct,
		selected,
		onclick
	}: {
		option: Option;
		index: number;
		answered: boolean;
		correct: boolean;
		selected: boolean;
		onclick: () => void;
	} = $props();
</script>

<button
	type="button"
	class="answer-option"
	class:correct={answered && correct}
	class:incorrect={answered && selected && !correct}
	class:chosen={selected}
	disabled={answered}
	{onclick}
>
	<kbd aria-hidden="true">{index + 1}</kbd><span>{option.label}</span>
	{#if answered && correct}<span class="answer-marker"
			>✓<span class="sr-only"> Respuesta correcta</span></span
		>{:else if answered && selected}<span class="answer-marker"
			>✕<span class="sr-only"> Tu respuesta, incorrecta</span></span
		>{/if}
</button>
