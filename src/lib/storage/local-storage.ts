import { STORAGE_KEY } from '../config/app.ts';
import { initialProgress } from '../game/scoring.ts';
import { parseProgress } from './migrations.ts';
import type { ProgressStorage } from './storage.ts';
import type { GameProgress } from '../types/progress.ts';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export class LocalStorageProgressStorage implements ProgressStorage {
	constructor(private readonly getStorage: () => StorageLike) {}
	load(): GameProgress {
		try {
			return parseProgress(this.getStorage().getItem(STORAGE_KEY));
		} catch {
			return initialProgress();
		}
	}
	save(progress: GameProgress): boolean {
		try {
			this.getStorage().setItem(STORAGE_KEY, JSON.stringify(progress));
			return true;
		} catch {
			return false;
		}
	}
	reset(): boolean {
		try {
			this.getStorage().removeItem(STORAGE_KEY);
			return true;
		} catch {
			return false;
		}
	}
}
export function browserStorage(): ProgressStorage {
	return new LocalStorageProgressStorage(() => window.localStorage);
}
