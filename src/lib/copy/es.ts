import type { GameMode, QuestionMode } from '../types/game.ts';
export const modes: {
	id: GameMode;
	name: string;
	description: string;
	symbol: string;
	note: string;
}[] = [
	{
		id: 'valor-principio',
		name: '¿Valor o principio?',
		description: 'Empieza por distinguir una idea de una regla para actuar.',
		symbol: '◐',
		note: 'Empieza aquí'
	},
	{
		id: 'principio-valor',
		name: 'Principio → Valor',
		description: 'Descubre qué valor hay detrás de una decisión.',
		symbol: '↖',
		note: 'Conecta las ideas'
	},
	{
		id: 'valor-principio-regla',
		name: 'Valor → Principio',
		description: 'Reconoce cómo se lleva un valor a la práctica.',
		symbol: '↘',
		note: 'Pasa a la acción'
	},
	{
		id: 'mixto',
		name: 'Reto mixto',
		description: 'Combina los tres ejercicios y pon a prueba lo aprendido.',
		symbol: '✳',
		note: 'Cuando domines la base'
	}
];
export const difficulties = ['Inicial', 'Intermedio', 'Avanzado', 'Experto'];
export const prompts: Record<QuestionMode, string> = {
	'valor-principio': '¿Es un valor o un principio?',
	'principio-valor': '¿Qué valor representa principalmente?',
	'valor-principio-regla': '¿Qué principio representa mejor este valor?'
};
export const es = {
	home: 'Inicio',
	progress: 'Mi progreso',
	play: 'Empezar a jugar',
	again: 'Jugar otra vez',
	back: 'Volver al inicio',
	continue: 'Continuar',
	results: 'Ver mi resumen',
	exit: 'Salir',
	correct: 'Correcto',
	incorrect: 'No exactamente',
	selected: 'Tu respuesta',
	answer: 'Respuesta principal',
	question: 'Pregunta',
	level: 'Nivel',
	streak: 'Racha',
	bestStreak: 'Mejor racha',
	difficulty: 'Dificultad',
	mode: 'Elige un modo',
	privacy: 'Tu progreso se queda en este dispositivo.',
	offline: 'Sin cuentas. Sin distracciones. A tu ritmo.',
	reset: 'Reiniciar progreso',
	resetTitle: '¿Borrar todo tu progreso?',
	resetDescription:
		'Se eliminarán tu XP, estadísticas y partidas completadas en este dispositivo. Esta acción no se puede deshacer.',
	cancel: 'Cancelar',
	erase: 'Borrar progreso',
	exitTitle: '¿Salir de la partida?',
	exitDescription: 'Las respuestas que ya has dado se guardan. Esta partida no se podrá reanudar.',
	storageWarning:
		'No se puede guardar en este navegador. Puedes seguir jugando, pero el progreso podría perderse al cerrar.',
	insufficient:
		'Todavía hay pocas respuestas para sacar conclusiones. Sigue explorando los conceptos.',
	completed: 'Partida completada',
	mastered: 'Lo que mejor dominas',
	practice: 'Conviene practicar',
	first: 'Tu primera partida empieza aquí',
	sectionLabel: 'APRENDER, UNA DECISIÓN A LA VEZ',
	foundationTitle: 'Una idea. Una forma de actuar.',
	foundationValue: 'Un valor es lo que consideras importante.',
	foundationPrinciple: 'Un principio convierte ese valor en una regla para decidir y actuar.'
};
