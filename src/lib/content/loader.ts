import values from './values.json';
import principles from './principles.json';
import { PERSONAL_DIMENSIONS, type Content, type Principle, type Value } from '../types/content.ts';

function object(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}
function nonempty(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}
function normalized(value: string): string {
	return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('es');
}
function fail(location: string, message: string): never {
	throw new Error(`${location}: ${message}`);
}
function strings(value: unknown, location: string): string[] {
	if (!Array.isArray(value) || !value.length || !value.every(nonempty)) {
		fail(location, 'se esperaba una lista no vacía de textos no vacíos');
	}
	const keys = value.map(normalized);
	if (new Set(keys).size !== keys.length) fail(location, 'textos duplicados');
	return value;
}
function metadata(
	record: Record<string, unknown>,
	location: string,
	seenReflections: Map<string, string>
) {
	if (record.dimensions !== undefined) {
		const dimensions = strings(record.dimensions, `${location}.dimensions`);
		if (dimensions.some((d) => !PERSONAL_DIMENSIONS.some((allowed) => allowed === d)))
			fail(location, 'dimensión desconocida');
	}
	if (record.tags !== undefined) strings(record.tags, `${location}.tags`);
	if (record.packId !== undefined && !nonempty(record.packId))
		fail(location, 'packId vacío o inválido');
	if (record.reflection === undefined) return;
	if (!object(record.reflection) || !Object.keys(record.reflection).length)
		fail(location, 'reflection debe ser un objeto con preguntas');
	for (const [key, raw] of Object.entries(record.reflection)) {
		if (!['purpose', 'mission', 'vision', 'questions'].includes(key))
			fail(location, `campo de reflexión desconocido: ${key}`);
		const field = `${location}.reflection.${key}`;
		for (const question of strings(raw, field)) {
			if (!question.trim().startsWith('¿') || !question.trim().endsWith('?'))
				fail(field, 'la reflexión debe formular una pregunta abierta');
			const previous = seenReflections.get(normalized(question));
			if (previous) fail(field, `reflexión duplicada con ${previous}`);
			seenReflections.set(normalized(question), field);
		}
	}
}
export function validateContent(rawValues: unknown, rawPrinciples: unknown): Content {
	if (!Array.isArray(rawValues) || !Array.isArray(rawPrinciples))
		fail('contenido', 'se requieren dos listas');
	const ids = new Set<string>();
	const names = new Set<string>();
	const reflections = new Map<string, string>();
	for (const v of rawValues) {
		if (!object(v) || !nonempty(v.id) || !/^[a-z0-9-]+$/.test(v.id)) fail('valor', 'ID inválido');
		if (ids.has(v.id)) fail(v.id, 'ID de valor duplicado');
		if (!nonempty(v.name) || !nonempty(v.shortDefinition) || !nonempty(v.explanation))
			fail(v.id, 'nombre o definición vacíos');
		if (names.has(normalized(v.name))) fail(v.id, 'nombre de valor duplicado');
		if (!Array.isArray(v.confusableWith)) fail(v.id, 'confusableWith debe ser una lista');
		metadata(v, v.id, reflections);
		names.add(normalized(v.name));
		ids.add(v.id);
	}
	function checkRefs(refs: unknown[], owner: string, field: string) {
		if (
			new Set(refs).size !== refs.length ||
			refs.some((id) => typeof id !== 'string' || !ids.has(id) || id === owner)
		)
			fail(`${owner}.${field}`, 'referencias inexistentes, propias o duplicadas');
	}
	for (const v of rawValues) checkRefs(v.confusableWith, v.id, 'confusableWith');
	const principleIds = new Set<string>();
	const texts = new Map<string, string>();
	const coverage = new Map<string, { count: number; initial: boolean }>();
	for (const p of rawPrinciples) {
		if (!object(p) || !nonempty(p.id) || !/^[a-z0-9-]+$/.test(p.id))
			fail('principio', 'ID inválido');
		if (principleIds.has(p.id)) fail(p.id, 'ID de principio duplicado');
		if (!nonempty(p.text) || !nonempty(p.explanation)) fail(p.id, 'texto o explicación vacíos');
		if (typeof p.primaryValueId !== 'string' || !ids.has(p.primaryValueId))
			fail(p.id, 'primaryValueId inexistente');
		if (!Array.isArray(p.relatedValueIds)) fail(p.id, 'relatedValueIds debe ser una lista');
		if (typeof p.difficulty !== 'number' || ![1, 2, 3, 4].includes(p.difficulty))
			fail(p.id, 'difficulty inválida');
		const previous = texts.get(normalized(p.text));
		if (previous) fail(p.id, `principio duplicado con ${previous}`);
		texts.set(normalized(p.text), p.id);
		checkRefs(p.relatedValueIds, p.primaryValueId, 'relatedValueIds');
		metadata(p, p.id, reflections);
		const count = coverage.get(p.primaryValueId) ?? { count: 0, initial: false };
		coverage.set(p.primaryValueId, {
			count: count.count + 1,
			initial: count.initial || p.difficulty === 1
		});
		principleIds.add(p.id);
	}
	if (ids.size < 4) fail('contenido', 'se requieren al menos cuatro valores');
	for (const id of ids) {
		const coverageForValue = coverage.get(id);
		if (!coverageForValue || coverageForValue.count < 2)
			fail(id, 'necesita al menos dos principios');
		if (!coverageForValue.initial) fail(id, 'necesita al menos un principio de dificultad 1');
	}
	return { values: rawValues as Value[], principles: rawPrinciples as Principle[] };
}
// La interfaz puede mostrar un error comprensible; los tests fallan con el detalle real.
export function loadContent(): { content: Content | null; error: string | null } {
	try {
		return { content: validateContent(values, principles), error: null };
	} catch {
		return {
			content: null,
			error: 'No se ha podido preparar el contenido. Prueba a actualizar la aplicación.'
		};
	}
}
