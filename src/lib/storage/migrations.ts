import { SCHEMA_VERSION, GAME_CONFIG } from '../config/app.ts';
import { initialProgress } from '../game/scoring.ts';
import type { GameProgress } from '../types/progress.ts';

function record(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}
const count = (value: unknown): value is number =>
	typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
// No hay versiones anteriores en V1. Versiones desconocidas no se interpretan parcialmente.
export function migrateProgress(value: unknown): GameProgress {
	if (!record(value) || value.schemaVersion !== SCHEMA_VERSION) return initialProgress();
	const fields = [
		'totalXp',
		'gamesPlayed',
		'questionsAnswered',
		'correctAnswers',
		'incorrectAnswers',
		'currentStreak',
		'bestStreak'
	];
	if (
		fields.some((key) => !count(value[key])) ||
		![1, 2, 3, 4].includes(Number(value.selectedDifficulty)) ||
		typeof value.selectedDifficulty !== 'number' ||
		!record(value.conceptProgress)
	)
		return initialProgress();
	const p = value as unknown as GameProgress;
	if (
		p.correctAnswers + p.incorrectAnswers !== p.questionsAnswered ||
		p.totalXp !== p.correctAnswers * GAME_CONFIG.xpPerCorrect ||
		p.currentStreak > p.bestStreak ||
		p.bestStreak > p.correctAnswers ||
		p.gamesPlayed * GAME_CONFIG.questionsPerSession > p.questionsAnswered
	)
		return initialProgress();
	let attempts = 0,
		correct = 0;
	for (const [id, item] of Object.entries(value.conceptProgress)) {
		if (
			!/^[a-z0-9-]+$/.test(id) ||
			!record(item) ||
			!count(item.attempts) ||
			!count(item.correct) ||
			!count(item.incorrect) ||
			item.attempts !== item.correct + item.incorrect ||
			(item.lastSeen !== undefined &&
				(typeof item.lastSeen !== 'string' ||
					!/^\d{4}-\d{2}-\d{2}T/.test(item.lastSeen) ||
					!Number.isFinite(Date.parse(item.lastSeen))))
		)
			return initialProgress();
		attempts += item.attempts;
		correct += item.correct;
	}
	if (attempts !== p.questionsAnswered || correct !== p.correctAnswers) return initialProgress();
	return { ...p, conceptProgress: structuredClone(p.conceptProgress) };
}
export function parseProgress(raw: string | null): GameProgress {
	try {
		return raw ? migrateProgress(JSON.parse(raw)) : initialProgress();
	} catch {
		return initialProgress();
	}
}
