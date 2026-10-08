import { describe, it, expect } from 'vitest';
import { loadContent } from '../../src/lib/content/loader.ts';
import { createSession, answerQuestion, continueSession } from '../../src/lib/game/engine.ts';
import { initialProgress, calculateScore, level } from '../../src/lib/game/scoring.ts';
import { seededRandom } from '../../src/lib/game/random.ts';
import { calculateMastery, accuracy } from '../../src/lib/game/mastery.ts';
const content = loadContent().content!;
const now = '2026-10-07T18:00:00.000Z';
const setup = () => {
	const progress = initialProgress();
	return { progress, session: createSession(content, 'mixto', 2, progress, seededRandom(42)) };
};
describe('sesión y puntuación', () => {
	it('da 10 XP por acierto y 0 por error; el nivel es independiente', () => {
		expect(calculateScore(true)).toBe(10);
		expect(calculateScore(false)).toBe(0);
		expect(level(0)).toBe(1);
		expect(level(99)).toBe(1);
		expect(level(100)).toBe(2);
	});
	it('no permite saltarse preguntas o elegir opciones inexistentes', () => {
		const s = setup();
		expect(continueSession(s.session, s.progress)).toEqual(s);
		expect(answerQuestion(s.session, s.progress, 'inventado', now)).toEqual(s);
	});
	it('no puntúa dos veces y conserva los parámetros de entrada', () => {
		const s = setup();
		const first = answerQuestion(s.session, s.progress, s.session.questions[0].correctId, now);
		expect(first.progress.totalXp).toBe(10);
		expect(s.progress.totalXp).toBe(0);
		expect(s.session.answers).toHaveLength(0);
		expect(
			answerQuestion(first.session, first.progress, first.session.questions[0].correctId, now)
		).toEqual(first);
	});
	it('incrementa racha, reinicia con error y mantiene la mejor', () => {
		let s = setup();
		for (let i = 0; i < 2; i++) {
			s = answerQuestion(
				s.session,
				s.progress,
				s.session.questions[s.session.index].correctId,
				now
			);
			s = continueSession(s.session, s.progress);
		}
		expect(s.progress.currentStreak).toBe(2);
		const q = s.session.questions[s.session.index];
		s = answerQuestion(s.session, s.progress, q.options.find((o) => o.id !== q.correctId)!.id, now);
		expect(s.progress.currentStreak).toBe(0);
		expect(s.progress.bestStreak).toBe(2);
		expect(s.session.result.bestStreak).toBe(2);
	});
	it('termina exactamente tras diez respuestas; continuar repetido no duplica partidas', () => {
		let s = setup();
		for (let i = 0; i < 10; i++) {
			s = answerQuestion(
				s.session,
				s.progress,
				s.session.questions[s.session.index].correctId,
				now
			);
			s = continueSession(s.session, s.progress);
		}
		expect(s.session.phase).toBe('RESULT');
		expect(s.progress.gamesPlayed).toBe(1);
		expect(s.progress.totalXp).toBe(100);
		expect(s.session.result.correct).toBe(10);
		expect(s.session.result.questions).toBe(10);
		expect(s.session.result.xpEarned).toBe(100);
		expect(continueSession(s.session, s.progress)).toEqual(s);
		expect(answerQuestion(s.session, s.progress, 'valor', now)).toEqual(s);
	});
	it('distingue la racha y XP de sesión del historial', () => {
		const p = { ...initialProgress(), currentStreak: 7, bestStreak: 7, totalXp: 70 };
		const session = createSession(content, 'mixto', 2, p, seededRandom(2));
		const s = answerQuestion(session, p, session.questions[0].correctId, now);
		expect(s.session.result.bestStreak).toBe(1);
		expect(s.session.result.xpEarned).toBe(10);
		expect(s.progress.currentStreak).toBe(8);
		expect(s.progress.totalXp).toBe(80);
	});
});
describe('dominio', () => {
	it.each([
		[0, 0, 'Nuevo', 0],
		[1, 1, 'Aprendiendo', 100],
		[2, 1, 'Aprendiendo', 50],
		[3, 3, 'En práctica', 100],
		[5, 4, 'Dominado', 80],
		[5, 3, 'En práctica', 60],
		[200, 159, 'En práctica', 80]
	])('%s intentos, %s aciertos', (attempts, correct, status, percent) => {
		expect(
			calculateMastery({
				attempts: attempts as number,
				correct: correct as number,
				incorrect: (attempts as number) - (correct as number)
			})
		).toEqual({ status, percent });
	});
	it('no genera NaN para datos nuevos', () => {
		expect(accuracy(0, 0)).toBe(0);
		expect(calculateMastery()).toEqual({ status: 'Nuevo', percent: 0 });
	});
});
