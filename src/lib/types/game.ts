import type { Difficulty } from './content.ts';
import type { ConceptProgress } from './progress.ts';
export type QuestionMode = 'valor-principio' | 'principio-valor' | 'valor-principio-regla';
export type GameMode = QuestionMode | 'mixto';
export type RandomSource = () => number;
export interface Option {
	id: string;
	label: string;
}
export interface Question {
	id: string;
	mode: QuestionMode;
	valueId: string;
	principleId?: string;
	prompt: string;
	options: Option[];
	correctId: string;
	explanation: string;
}
export interface Answer {
	questionId: string;
	optionId: string;
	correct: boolean;
}
export interface SessionResult {
	questions: number;
	correct: number;
	incorrect: number;
	xpEarned: number;
	currentStreak: number;
	bestStreak: number;
	conceptResults: Record<string, ConceptProgress>;
}
export interface Session {
	mode: GameMode;
	difficulty: Difficulty;
	phase: 'QUESTION' | 'ANSWERED' | 'RESULT';
	questions: Question[];
	index: number;
	answers: Answer[];
	result: SessionResult;
}
