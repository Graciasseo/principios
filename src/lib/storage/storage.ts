import type { GameProgress } from '../types/progress.ts';
export interface ProgressStorage {
	load(): GameProgress;
	save(progress: GameProgress): boolean;
	reset(): boolean;
}
