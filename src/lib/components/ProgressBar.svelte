<script lang="ts">
	let { value, max = 100, label }: { value: number; max?: number; label: string } = $props();
</script>

<progress {value} {max} aria-label={label}></progress>
