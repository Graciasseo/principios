import { GAME_CONFIG, SCHEMA_VERSION } from '../config/app.ts';
import type { GameProgress, ConceptProgress } from '../types/progress.ts';
export const calculateScore = (correct: boolean) => (correct ? GAME_CONFIG.xpPerCorrect : 0);
export const level = (xp: number) => Math.floor(xp / GAME_CONFIG.xpPerLevel) + 1;
export function initialProgress(): GameProgress {
	return {
		schemaVersion: SCHEMA_VERSION,
		totalXp: 0,
		gamesPlayed: 0,
		questionsAnswered: 0,
		correctAnswers: 0,
		incorrectAnswers: 0,
		currentStreak: 0,
		bestStreak: 0,
		selectedDifficulty: GAME_CONFIG.defaultDifficulty,
		conceptProgress: {}
	};
}
export function recordConcept(
	previous: ConceptProgress | undefined,
	correct: boolean,
	now: string
): ConceptProgress {
	return {
		attempts: (previous?.attempts ?? 0) + 1,
		correct: (previous?.correct ?? 0) + Number(correct),
		incorrect: (previous?.incorrect ?? 0) + Number(!correct),
		lastSeen: now
	};
}
export function recordProgress(
	progress: GameProgress,
	valueId: string,
	correct: boolean,
	now: string
): GameProgress {
	const currentStreak = correct ? progress.currentStreak + 1 : 0;
	return {
		...progress,
		totalXp: progress.totalXp + calculateScore(correct),
		questionsAnswered: progress.questionsAnswered + 1,
		correctAnswers: progress.correctAnswers + Number(correct),
		incorrectAnswers: progress.incorrectAnswers + Number(!correct),
		currentStreak,
		bestStreak: Math.max(progress.bestStreak, currentStreak),
		conceptProgress: {
			...progress.conceptProgress,
			[valueId]: recordConcept(progress.conceptProgress[valueId], correct, now)
		}
	};
}
