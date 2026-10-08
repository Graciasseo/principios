<script lang="ts">
	import { onMount } from 'svelte';
	import { es } from '../copy/es.ts';
	let {
		title,
		description,
		confirmLabel,
		onconfirm,
		oncancel
	}: {
		title: string;
		description: string;
		confirmLabel: string;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();
	let dialog: HTMLDialogElement;
	let cancelButton: HTMLButtonElement;
	onMount(() => {
		const previous = document.activeElement;
		dialog.showModal();
		cancelButton.focus();
		return () => {
			if (previous instanceof HTMLElement) previous.focus();
		};
	});
</script>

<dialog
	bind:this={dialog}
	oncancel={(event) => {
		event.preventDefault();
		oncancel();
	}}
	aria-labelledby="confirm-title"
	aria-describedby="confirm-description"
>
	<h2 id="confirm-title">{title}</h2>
	<p id="confirm-description">{description}</p>
	<div class="button-row">
		<button class="secondary" bind:this={cancelButton} onclick={oncancel}>{es.cancel}</button
		><button class="danger" onclick={onconfirm}>{confirmLabel}</button>
	</div>
</dialog>
