import type { Content, Difficulty, Principle, Value } from '../types/content.ts';
import type { GameMode, Question, QuestionMode, RandomSource } from '../types/game.ts';
import type { GameProgress } from '../types/progress.ts';
import { GAME_CONFIG } from '../config/app.ts';
import { adaptiveWeight, optionCount } from './difficulty.ts';
import { shuffle, weightedPick } from './random.ts';

export const questionModes: QuestionMode[] = [
	'valor-principio',
	'principio-valor',
	'valor-principio-regla'
];
export function parseMode(mode: unknown): GameMode {
	return mode === 'mixto' || questionModes.includes(mode as QuestionMode)
		? (mode as GameMode)
		: 'valor-principio';
}

export function getDistractors(
	content: Content,
	value: Value,
	principle: Principle,
	difficulty: Difficulty,
	random: RandomSource,
	reverse = false
): Value[] {
	const candidates = content.values.filter(
		(v) =>
			v.id !== value.id &&
			(difficulty >= 3 || !principle.relatedValueIds.includes(v.id)) &&
			(!reverse ||
				content.principles.some(
					(p) =>
						p.primaryValueId === v.id &&
						p.difficulty <= difficulty &&
						!p.relatedValueIds.includes(value.id)
				))
	);
	const close = shuffle(
		candidates.filter((v) => value.confusableWith.includes(v.id)),
		random
	);
	const distant = shuffle(
		candidates.filter((v) => !value.confusableWith.includes(v.id)),
		random
	);
	const ranked =
		difficulty === 1
			? [...distant, ...close]
			: difficulty === 2
				? [...close.slice(0, 1), ...distant, ...close.slice(1)]
				: [...close, ...distant];
	const result = ranked.slice(0, optionCount(difficulty) - 1);
	if (result.length !== optionCount(difficulty) - 1)
		throw new Error('No hay suficientes distractores no ambiguos.');
	return result;
}

export function generateQuestion(
	content: Content,
	value: Value,
	principle: Principle,
	mode: QuestionMode,
	difficulty: Difficulty,
	random: RandomSource,
	categoryValue = false
): Question {
	const related = principle.relatedValueIds.map(
		(id) => content.values.find((v) => v.id === id)!.name
	);
	const explanation = `${principle.explanation} ${value.explanation}${related.length ? ` También se relaciona con ${related.join(', ')}.` : ''}`;
	if (mode === 'valor-principio')
		return {
			id: categoryValue ? `categoria:${value.id}` : `categoria:${principle.id}`,
			mode,
			valueId: value.id,
			principleId: categoryValue ? undefined : principle.id,
			prompt: categoryValue ? value.name : principle.text,
			options: [
				{ id: 'valor', label: 'Valor' },
				{ id: 'principio', label: 'Principio' }
			],
			correctId: categoryValue ? 'valor' : 'principio',
			explanation: categoryValue
				? `${value.name} expresa algo que consideramos importante. ${value.shortDefinition} Un principio, en cambio, lo convierte en una regla concreta para actuar.`
				: `Es un principio porque propone una regla concreta de conducta. ${explanation}`
		};
	const distractors = getDistractors(
		content,
		value,
		principle,
		difficulty,
		random,
		mode === 'valor-principio-regla'
	);
	if (mode === 'principio-valor')
		return {
			id: `relacion:${principle.id}`,
			mode,
			valueId: value.id,
			principleId: principle.id,
			prompt: principle.text,
			options: shuffle(
				[value, ...distractors].map((v) => ({ id: v.id, label: v.name })),
				random
			),
			correctId: value.id,
			explanation
		};
	const wrongPrinciples = distractors.map(
		(v) =>
			shuffle(
				content.principles.filter(
					(p) =>
						p.primaryValueId === v.id &&
						p.difficulty <= difficulty &&
						!p.relatedValueIds.includes(value.id)
				),
				random
			)[0]
	);
	return {
		id: `regla:${value.id}`,
		mode,
		valueId: value.id,
		principleId: principle.id,
		prompt: value.name,
		options: shuffle(
			[principle, ...wrongPrinciples].map((p) => ({ id: p.id, label: p.text })),
			random
		),
		correctId: principle.id,
		explanation
	};
}

export function generateQuestions(
	content: Content,
	mode: GameMode,
	difficulty: Difficulty,
	progress: GameProgress,
	random: RandomSource,
	adaptive: boolean = GAME_CONFIG.adaptive
): Question[] {
	const result: Question[] = [];
	const used = new Set<string>();
	const counts: Record<string, number> = {};
	const schedule = shuffle(
		Array.from({ length: GAME_CONFIG.questionsPerSession }, (_, i) =>
			mode === 'mixto' ? questionModes[i % questionModes.length] : mode
		),
		random
	);
	const categories = shuffle(
		[true, true, true, true, true, false, false, false, false, false],
		random
	);
	for (const [index, kind] of schedule.entries()) {
		const categoryValue = categories[index];
		const eligible = content.principles.filter(
			(p) =>
				p.difficulty <= difficulty &&
				!used.has(
					kind === 'valor-principio-regla'
						? `regla:${p.primaryValueId}`
						: kind === 'principio-valor'
							? `relacion:${p.id}`
							: categoryValue
								? `categoria:${p.primaryValueId}`
								: `categoria:${p.id}`
				)
		);
		const candidates = content.values.filter((v) =>
			eligible.some((p) => p.primaryValueId === v.id)
		);
		const value = weightedPick(
			candidates,
			(v) =>
				adaptiveWeight(progress.conceptProgress[v.id], adaptive) / (1 + (counts[v.id] ?? 0) * 3),
			random
		);
		const principle = weightedPick(
			eligible.filter((p) => p.primaryValueId === value.id),
			(p) => (p.difficulty === difficulty ? 2 : 1),
			random
		);
		const question = generateQuestion(
			content,
			value,
			principle,
			kind,
			difficulty,
			random,
			categoryValue
		);
		used.add(question.id);
		counts[value.id] = (counts[value.id] ?? 0) + 1;
		result.push(question);
	}
	return result;
}
