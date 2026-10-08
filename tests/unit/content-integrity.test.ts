import { describe, it, expect } from 'vitest';
import values from '../../src/lib/content/values.json';
import principles from '../../src/lib/content/principles.json';
import { validateContent } from '../../src/lib/content/loader.ts';
describe('integridad del contenido', () => {
	it('valida los 34 valores y 136 principios completos', () => {
		const content = validateContent(values, principles);
		expect(content.values).toHaveLength(34);
		expect(content.principles).toHaveLength(136);
	});
	it.each(['primaryValueId', 'relatedValueIds'])(
		'rechaza referencias inexistentes en %s',
		(key) => {
			const broken = structuredClone(principles);
			Object.assign(broken[0], { [key]: key === 'primaryValueId' ? 'autnomia' : ['autnomia'] });
			expect(() => validateContent(values, broken)).toThrow();
		}
	);
	it('rechaza IDs duplicados en ambas listas', () => {
		expect(() => validateContent([...values, values[0]], principles)).toThrow();
		expect(() => validateContent(values, [...principles, principles[0]])).toThrow();
	});
	it('rechaza confusiones inexistentes, auto referencias y repeticiones', () => {
		for (const refs of [['desconocido'], [values[0].id], ['integridad', 'integridad']]) {
			const broken = structuredClone(values);
			broken[0].confusableWith = refs;
			expect(() => validateContent(broken, principles)).toThrow();
		}
	});
	it.each([0, 5, 1.5, '1', null])('rechaza dificultad inválida %s', (difficulty) => {
		const broken = structuredClone(principles);
		Object.assign(broken[0], { difficulty });
		expect(() => validateContent(values, broken)).toThrow();
	});
	it('rechaza texto, nombre y explicaciones vacíos', () => {
		expect(() => validateContent(values, [{ ...principles[0], text: ' ' }])).toThrow();
		expect(() => validateContent([{ ...values[0], name: '' }], principles)).toThrow();
		expect(() => validateContent(values, [{ ...principles[0], explanation: '' }])).toThrow();
	});
});

describe('metadatos y cobertura editorial', () => {
	it('mantiene los IDs originales para conservar el significado del progreso', () => {
		const original = [
			'honestidad',
			'integridad',
			'transparencia',
			'autonomia',
			'libertad',
			'responsabilidad',
			'coherencia',
			'simplicidad',
			'excelencia',
			'respeto',
			'empatia',
			'justicia'
		];
		for (const id of original) {
			expect(values.some((v) => v.id === id)).toBe(true);
			for (let i = 1; i <= 4; i++)
				expect(principles.find((p) => p.id === `${id}-0${i}`)?.primaryValueId).toBe(id);
		}
	});
	it('cada valor tiene 3–5 principios, al menos uno inicial y varios contextos', () => {
		for (const value of values) {
			const items = principles.filter((p) => p.primaryValueId === value.id);
			expect(items.length).toBeGreaterThanOrEqual(3);
			expect(items.length).toBeLessThanOrEqual(5);
			expect(items.some((p) => p.difficulty === 1)).toBe(true);
			expect(new Set(items.flatMap((p) => p.dimensions)).size).toBeGreaterThanOrEqual(2);
		}
	});
	it('mantiene el trabajo como contexto minoritario y cubre las nueve dimensiones', () => {
		expect(
			principles.filter((p) => p.dimensions.includes('work')).length / principles.length
		).toBeLessThanOrEqual(0.15);
		expect(new Set(principles.flatMap((p) => p.dimensions)).size).toBe(9);
		expect(principles.every((p) => p.dimensions.length > 0)).toBe(true);
	});
	it('acepta contenido sin metadatos opcionales', () => {
		const oldValues = values.map(({ id, name, shortDefinition, explanation, confusableWith }) => ({
			id,
			name,
			shortDefinition,
			explanation,
			confusableWith
		}));
		const oldPrinciples = principles.map(
			({ id, text, primaryValueId, relatedValueIds, explanation, difficulty }) => ({
				id,
				text,
				primaryValueId,
				relatedValueIds,
				explanation,
				difficulty
			})
		);
		expect(validateContent(oldValues, oldPrinciples).principles).toHaveLength(principles.length);
	});
	for (const target of ['value', 'principle']) {
		const validateMetadata = (change: Record<string, unknown>) => {
			const vs = structuredClone(values);
			const ps = structuredClone(principles);
			Object.assign(target === 'value' ? vs[0] : ps[0], change);
			return validateContent(vs, ps);
		};
		it.each([null, 'self', [], ['unknown'], ['self', 'self'], [123]])(
			`${target}: rechaza dimensions inválidas %j`,
			(dimensions) => {
				expect(() => validateMetadata({ dimensions })).toThrow();
			}
		);
		it.each([
			null,
			[],
			{},
			'pregunta',
			{ purpuse: ['¿Qué quieres aportar?'] },
			{ purpose: '¿Qué quieres aportar?' },
			{ questions: [] },
			{ mission: [' '] },
			{ vision: [42] },
			{ questions: ['Tu propósito es cuidar.'] },
			{ questions: ['¿Qué importa?', '  ¿Qué   importa?  '] }
		])(`${target}: rechaza reflection inválida %j`, (reflection) => {
			expect(() => validateMetadata({ reflection })).toThrow();
		});
		it(`${target}: acepta todos los campos de reflexión y metadatos`, () => {
			expect(
				validateMetadata({
					dimensions: ['self', 'identity'],
					reflection: {
						purpose: ['¿Qué merece tu energía?'],
						mission: ['¿Qué práctica quieres ensayar?'],
						vision: ['¿Qué horizonte te gustaría explorar?'],
						questions: ['¿Qué has aprendido hoy sobre tus prioridades?']
					},
					tags: ['cotidiano'],
					packId: 'general'
				}).values
			).toHaveLength(values.length);
		});
	}
	it('detecta una misma reflexión copiada entre registros y categorías', () => {
		const vs = structuredClone(values);
		const ps = structuredClone(principles);
		Object.assign(vs[0], { reflection: { purpose: ['¿Qué te importa hoy?'] } });
		Object.assign(ps[0], { reflection: { questions: ['  ¿Qué   te importa hoy?  '] } });
		expect(() => validateContent(vs, ps)).toThrow(/reflexión duplicada/);
	});
	it('detecta textos de principios duplicados aunque cambie el ID, capitalización o espacios', () => {
		const ps = structuredClone(principles);
		ps[1].text = ' ' + ps[0].text.toUpperCase().replaceAll(' ', '  ') + ' ';
		expect(() => validateContent(values, ps)).toThrow(/principio duplicado/);
	});
	it('detecta nombres duplicados sin confundirlos con IDs distintos', () => {
		const vs = structuredClone(values);
		vs[1].name = vs[0].name.toUpperCase();
		expect(() => validateContent(vs, principles)).toThrow(/nombre de valor duplicado/);
	});
	it.each([0, 1])('detecta valores aislados con %s principios', (count) => {
		const ps = principles
			.filter((p) => p.primaryValueId !== values[0].id)
			.concat(principles.filter((p) => p.primaryValueId === values[0].id).slice(0, count));
		expect(() => validateContent(values, ps)).toThrow(/al menos dos principios/);
	});
	it('detecta un valor sin contenido accesible desde inicial', () => {
		const ps = principles.map((p) => ({
			...p,
			difficulty: p.primaryValueId === values[0].id ? 2 : p.difficulty
		}));
		expect(() => validateContent(values, ps)).toThrow(/dificultad 1/);
	});
	it('rechaza definiciones cortas vacías y metadatos auxiliares mal formados', () => {
		const vs = structuredClone(values);
		vs[0].shortDefinition = ' ';
		expect(() => validateContent(vs, principles)).toThrow(/definición/);
		for (const data of [{ tags: [''] }, { tags: 'personal' }, { packId: 42 }]) {
			const copy = structuredClone(values);
			Object.assign(copy[0], data);
			expect(() => validateContent(copy, principles)).toThrow();
		}
	});
});
