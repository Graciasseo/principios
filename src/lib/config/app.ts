export const appConfig = {
	name: 'Principios',
	tagline: 'Aprende a convertir lo que valoras en cómo actúas.',
	description:
		'Juego educativo para aprender a distinguir valores y principios y convertir ideas importantes en reglas para actuar.'
};
export const GAME_CONFIG = {
	questionsPerSession: 10,
	xpPerCorrect: 10,
	xpPerLevel: 100,
	defaultDifficulty: 2,
	adaptive: true
} as const;
export const STORAGE_KEY = 'principios-progress';
export const SCHEMA_VERSION = 1;
