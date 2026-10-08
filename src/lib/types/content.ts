export type Difficulty = 1 | 2 | 3 | 4;
export const PERSONAL_DIMENSIONS = [
	'identity',
	'self',
	'relationships',
	'decisions',
	'growth',
	'contribution',
	'community',
	'work',
	'future'
] as const;
export type PersonalDimension = (typeof PERSONAL_DIMENSIONS)[number];
export interface Reflection {
	purpose?: string[];
	mission?: string[];
	vision?: string[];
	questions?: string[];
}
export interface ContentMetadata {
	dimensions?: PersonalDimension[];
	reflection?: Reflection;
	tags?: string[];
	packId?: string;
}
export interface Value extends ContentMetadata {
	id: string;
	name: string;
	shortDefinition: string;
	explanation: string;
	confusableWith: string[];
}
export interface Principle extends ContentMetadata {
	id: string;
	text: string;
	primaryValueId: string;
	relatedValueIds: string[];
	explanation: string;
	difficulty: Difficulty;
}
export interface Content {
	values: Value[];
	principles: Principle[];
}
