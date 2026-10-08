import { describe, it, expect } from 'vitest';
import values from '../../src/lib/content/values.json';
import principles from '../../src/lib/content/principles.json';
import { validateContent } from '../../src/lib/content/loader.ts';
import {
	generateQuestion,
	generateQuestions,
	getDistractors,
	questionModes
} from '../../src/lib/game/generator.ts';
import { seededRandom } from '../../src/lib/game/random.ts';
import { initialProgress } from '../../src/lib/game/scoring.ts';
import { adaptiveWeight, optionCount } from '../../src/lib/game/difficulty.ts';
import type { Difficulty } from '../../src/lib/types/content.ts';
const content = validateContent(values, principles);
describe('generador determinista', () => {
	for (const mode of [...questionModes, 'mixto'] as const)
		for (const difficulty of [1, 2, 3, 4] as Difficulty[]) {
			it(`${mode}, dificultad ${difficulty}: 100 partidas sin preguntas u opciones duplicadas`, () => {
				const positions = new Set<number>();
				for (let seed = 1; seed <= 100; seed++) {
					const qs = generateQuestions(
						content,
						mode,
						difficulty,
						initialProgress(),
						seededRandom(seed)
					);
					expect(qs).toHaveLength(10);
					expect(new Set(qs.map((q) => q.id)).size).toBe(10);
					expect(new Set(qs.map((q) => q.mode + ':' + q.prompt)).size).toBe(10);
					if (mode === 'mixto') expect(new Set(qs.map((q) => q.mode)).size).toBe(3);
					if (mode === 'valor-principio')
						expect(qs.filter((q) => q.correctId === 'valor')).toHaveLength(5);
					for (const q of qs) {
						expect(q.options).toHaveLength(
							q.mode === 'valor-principio' ? 2 : optionCount(difficulty)
						);
						expect(q.options.filter((o) => o.id === q.correctId)).toHaveLength(1);
						expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
						expect(new Set(q.options.map((o) => o.label)).size).toBe(q.options.length);
						const p = content.principles.find((p) => p.id === q.principleId);
						if (p) expect(p.difficulty).toBeLessThanOrEqual(difficulty);
						if (q.mode === 'principio-valor') {
							for (const o of q.options) {
								expect(values.some((v) => v.id === o.id)).toBe(true);
								if (difficulty <= 2 && o.id !== q.correctId)
									expect(p?.relatedValueIds).not.toContain(o.id);
							}
						}
						if (q.mode === 'valor-principio-regla') {
							for (const o of q.options) {
								const op = content.principles.find((p) => p.id === o.id)!;
								expect(op).toBeDefined();
								if (o.id !== q.correctId) {
									expect(op.primaryValueId).not.toBe(q.valueId);
									expect(op.relatedValueIds).not.toContain(q.valueId);
								}
							}
						}
						positions.add(q.options.findIndex((o) => o.id === q.correctId));
					}
				}
				expect(positions.size).toBe(mode === 'valor-principio' ? 2 : optionCount(difficulty));
			});
		}
	it('prioriza conceptos lejanos en inicial y cercanos en experto', () => {
		const value = content.values.find((v) => v.id === 'honestidad')!;
		const p = content.principles.find((p) => p.primaryValueId === value.id)!;
		expect(
			getDistractors(content, value, p, 1, seededRandom(1)).every(
				(v) => !value.confusableWith.includes(v.id)
			)
		).toBe(true);
		const advanced = getDistractors(content, value, p, 4, seededRandom(1));
		expect(advanced).toHaveLength(3);
		expect(advanced.every((v) => value.confusableWith.includes(v.id))).toBe(true);
	});
	it('es reproducible y permite desactivar la adaptación', () => {
		const p = initialProgress();
		p.conceptProgress.honestidad = { attempts: 20, correct: 0, incorrect: 20 };
		expect(adaptiveWeight(p.conceptProgress.honestidad)).toBe(2);
		expect(adaptiveWeight(p.conceptProgress.honestidad, false)).toBe(1);
		expect(generateQuestions(content, 'mixto', 3, p, seededRandom(42), false)).toEqual(
			generateQuestions(content, 'mixto', 3, initialProgress(), seededRandom(42), false)
		);
	});
	it('la adaptación aumenta moderadamente la presencia del concepto fallado', () => {
		const p = initialProgress();
		p.conceptProgress.honestidad = { attempts: 20, correct: 0, incorrect: 20 };
		let baseline = 0,
			adaptive = 0;
		for (let seed = 0; seed < 300; seed++) {
			baseline += generateQuestions(
				content,
				'principio-valor',
				2,
				p,
				seededRandom(seed),
				false
			).filter((q) => q.valueId === 'honestidad').length;
			adaptive += generateQuestions(
				content,
				'principio-valor',
				2,
				p,
				seededRandom(seed),
				true
			).filter((q) => q.valueId === 'honestidad').length;
		}
		expect(adaptive).toBeGreaterThan(baseline);
		expect(adaptive).toBeLessThan(baseline * 2);
	});
});

describe('compatibilidad del catálogo ampliado', () => {
	it('cada principio se puede preguntar en ambos sentidos y en todos sus niveles elegibles', () => {
		for (const principle of content.principles) {
			const value = content.values.find((v) => v.id === principle.primaryValueId)!;
			for (const difficulty of [1, 2, 3, 4] as Difficulty[]) {
				if (difficulty < principle.difficulty) continue;
				for (const mode of ['principio-valor', 'valor-principio-regla'] as const)
					for (let seed = 1; seed <= 5; seed++) {
						const q = generateQuestion(
							content,
							value,
							principle,
							mode,
							difficulty,
							seededRandom(seed)
						);
						expect(q.options).toHaveLength(optionCount(difficulty));
						expect(q.options.filter((o) => o.id === q.correctId)).toHaveLength(1);
						expect(new Set(q.options.map((o) => o.label)).size).toBe(q.options.length);
						for (const option of q.options.filter((o) => o.id !== q.correctId)) {
							if (mode === 'principio-valor' && difficulty <= 2)
								expect(principle.relatedValueIds).not.toContain(option.id);
							if (mode === 'valor-principio-regla')
								expect(
									content.principles.find((p) => p.id === option.id)!.relatedValueIds
								).not.toContain(value.id);
						}
					}
			}
		}
	});
	it('los metadatos no alteran selección, dificultad ni feedback', () => {
		const stripped = {
			values: content.values.map(({ id, name, shortDefinition, explanation, confusableWith }) => ({
				id,
				name,
				shortDefinition,
				explanation,
				confusableWith
			})),
			principles: content.principles.map(
				({ id, text, primaryValueId, relatedValueIds, explanation, difficulty }) => ({
					id,
					text,
					primaryValueId,
					relatedValueIds,
					explanation,
					difficulty
				})
			)
		};
		for (const mode of [...questionModes, 'mixto'] as const)
			for (const difficulty of [1, 2, 3, 4] as Difficulty[]) {
				expect(
					generateQuestions(content, mode, difficulty, initialProgress(), seededRandom(23))
				).toEqual(
					generateQuestions(stripped, mode, difficulty, initialProgress(), seededRandom(23))
				);
			}
	});
});
