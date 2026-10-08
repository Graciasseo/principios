import type { Content, Difficulty } from '../types/content.ts';
import type { GameMode, RandomSource, Session } from '../types/game.ts';
import type { GameProgress } from '../types/progress.ts';
import { generateQuestions } from './generator.ts';
import { calculateScore, recordConcept, recordProgress } from './scoring.ts';

export function createSession(
	content: Content,
	mode: GameMode,
	difficulty: Difficulty,
	progress: GameProgress,
	random: RandomSource
): Session {
	return {
		mode,
		difficulty,
		phase: 'QUESTION',
		questions: generateQuestions(content, mode, difficulty, progress, random),
		index: 0,
		answers: [],
		result: {
			questions: 0,
			correct: 0,
			incorrect: 0,
			xpEarned: 0,
			currentStreak: 0,
			bestStreak: 0,
			conceptResults: {}
		}
	};
}
export function answerQuestion(
	session: Session,
	progress: GameProgress,
	optionId: string,
	now: string
): { session: Session; progress: GameProgress } {
	const q = session.questions[session.index];
	if (session.phase !== 'QUESTION' || !q.options.some((o) => o.id === optionId))
		return { session, progress };
	const correct = optionId === q.correctId;
	const currentStreak = correct ? session.result.currentStreak + 1 : 0;
	const result = {
		questions: session.result.questions + 1,
		correct: session.result.correct + Number(correct),
		incorrect: session.result.incorrect + Number(!correct),
		xpEarned: session.result.xpEarned + calculateScore(correct),
		currentStreak,
		bestStreak: Math.max(currentStreak, session.result.bestStreak),
		conceptResults: {
			...session.result.conceptResults,
			[q.valueId]: recordConcept(session.result.conceptResults[q.valueId], correct, now)
		}
	};
	return {
		session: {
			...session,
			phase: 'ANSWERED',
			answers: [...session.answers, { questionId: q.id, optionId, correct }],
			result
		},
		progress: recordProgress(progress, q.valueId, correct, now)
	};
}
export function continueSession(
	session: Session,
	progress: GameProgress
): { session: Session; progress: GameProgress } {
	if (session.phase !== 'ANSWERED') return { session, progress };
	if (session.index === session.questions.length - 1)
		return {
			session: { ...session, phase: 'RESULT' },
			progress: { ...progress, gamesPlayed: progress.gamesPlayed + 1 }
		};
	return { session: { ...session, index: session.index + 1, phase: 'QUESTION' }, progress };
}
