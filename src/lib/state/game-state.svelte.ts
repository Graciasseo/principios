import { getContext, setContext } from 'svelte';
import { nowISO } from './time.ts';
import { loadContent } from '../content/loader.ts';
import { initialProgress } from '../game/scoring.ts';
import { answerQuestion, continueSession, createSession } from '../game/engine.ts';
import { browserStorage } from '../storage/local-storage.ts';
import type { ProgressStorage } from '../storage/storage.ts';
import type { Difficulty } from '../types/content.ts';
import type { GameMode, Session } from '../types/game.ts';

export class GameState {
	progress = $state(initialProgress());
	session = $state<Session | null>(null);
	ready = $state(false);
	storageAvailable = $state(true);
	error = $state<string | null>(null);
	readonly dataset = loadContent();
	private storage: ProgressStorage | null = null;
	init() {
		if (this.ready) return;
		this.storage = browserStorage();
		this.progress = this.storage.load();
		this.ready = true;
	}
	private save() {
		if (this.storage) this.storageAvailable = this.storage.save($state.snapshot(this.progress));
	}
	setDifficulty(difficulty: Difficulty) {
		this.progress = { ...this.progress, selectedDifficulty: difficulty };
		this.save();
	}
	start(mode: GameMode, difficulty: Difficulty) {
		this.init();
		this.error = this.dataset.error;
		if (!this.dataset.content) return;
		try {
			this.session = createSession(
				this.dataset.content,
				mode,
				difficulty,
				this.progress,
				Math.random
			);
			this.setDifficulty(difficulty);
		} catch {
			this.error =
				'No hemos podido preparar esta partida. Vuelve al inicio para intentarlo de nuevo.';
		}
	}
	answer(optionId: string) {
		if (!this.session) return;
		const result = answerQuestion(this.session, this.progress, optionId, nowISO());
		this.session = result.session;
		this.progress = result.progress;
		this.save();
	}
	next() {
		if (!this.session) return;
		const result = continueSession(this.session, this.progress);
		this.session = result.session;
		this.progress = result.progress;
		this.save();
	}
	reset(): boolean {
		const cleared = this.storage?.reset() ?? false;
		this.storageAvailable = cleared;
		if (cleared) {
			this.progress = initialProgress();
			this.session = null;
		}
		return cleared;
	}
}
const KEY = Symbol('game-state');
export const provideGameState = () => setContext(KEY, new GameState());
export const useGameState = () => getContext<GameState>(KEY);
