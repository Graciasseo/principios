import type { ConceptProgress } from '../types/progress.ts';
export const accuracy = (correct: number, attempts: number) =>
	attempts ? Math.round((correct / attempts) * 100) : 0;
export function calculateMastery(progress?: ConceptProgress) {
	const attempts = progress?.attempts ?? 0;
	const percent = accuracy(progress?.correct ?? 0, attempts);
	const status = !attempts
		? 'Nuevo'
		: attempts < 3
			? 'Aprendiendo'
			: attempts >= 5 && (progress?.correct ?? 0) / attempts >= 0.8
				? 'Dominado'
				: 'En práctica';
	return { percent, status };
}
