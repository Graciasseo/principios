import type { Difficulty } from '../types/content.ts';
import type { ConceptProgress } from '../types/progress.ts';
export const optionCount = (difficulty: Difficulty) => Math.min(difficulty + 1, 4);
export function parseDifficulty(value: unknown): Difficulty {
	const n = Number(value);
	return n === 1 || n === 2 || n === 3 || n === 4 ? n : 2;
}
export function adaptiveWeight(progress?: ConceptProgress, enabled = true): number {
	return enabled && progress?.attempts ? 1 + progress.incorrect / progress.attempts : 1;
}
