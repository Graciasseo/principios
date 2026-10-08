import type { RandomSource } from '../types/game.ts';
export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
export function weightedPick<T>(
	items: readonly T[],
	weight: (item: T) => number,
	random: RandomSource
): T {
	if (!items.length) throw new Error('No hay candidatos para generar la pregunta.');
	let cursor = random() * items.reduce((sum, item) => sum + weight(item), 0);
	for (const item of items) {
		cursor -= weight(item);
		if (cursor < 0) return item;
	}
	return items[items.length - 1];
}
export function seededRandom(seed: number): RandomSource {
	return () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};
}
