<script lang="ts">
	import type { GameMode } from '../types/game.ts';
	let {
		mode,
		selected,
		onclick,
		number
	}: {
		mode: { id: GameMode; name: string; description: string; symbol: string; note: string };
		selected: boolean;
		onclick: () => void;
		number: number;
	} = $props();
</script>

<button
	type="button"
	class="mode-card"
	data-mode={mode.id}
	class:selected
	aria-pressed={selected}
	{onclick}
>
	<span class="mode-top"
		><span class="mode-symbol" aria-hidden="true">{mode.symbol}</span><span class="mode-number"
			>0{number}</span
		></span
	>
	<span class="mode-name">{mode.name}</span><span class="mode-description">{mode.description}</span>
	<span class="mode-bottom"
		>{mode.note}<span class="mode-check" aria-hidden="true">{selected ? '✓' : '↗'}</span></span
	>
</button>
