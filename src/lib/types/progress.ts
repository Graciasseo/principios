import type { Difficulty } from './content.ts';
export interface ConceptProgress {
	attempts: number;
	correct: number;
	incorrect: number;
	lastSeen?: string;
}
export interface GameProgress {
	schemaVersion: number;
	totalXp: number;
	gamesPlayed: number;
	questionsAnswered: number;
	correctAnswers: number;
	incorrectAnswers: number;
	currentStreak: number;
	bestStreak: number;
	selectedDifficulty: Difficulty;
	conceptProgress: Record<string, ConceptProgress>;
}
