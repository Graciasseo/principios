import { describe, it, expect } from 'vitest';
import { LocalStorageProgressStorage } from '../../src/lib/storage/local-storage.ts';
import { parseProgress, migrateProgress } from '../../src/lib/storage/migrations.ts';
import { initialProgress, recordProgress } from '../../src/lib/game/scoring.ts';
import { STORAGE_KEY } from '../../src/lib/config/app.ts';
const progress = recordProgress(initialProgress(), 'honestidad', true, '2026-10-07T18:00:00.000Z');
describe('persistencia segura', () => {
	it('carga, guarda y resetea utilizando una sola clave', () => {
		const data = new Map<string, string>();
		const storage = new LocalStorageProgressStorage(() => ({
			getItem: (key) => data.get(key) ?? null,
			setItem: (key, value) => {
				data.set(key, value);
			},
			removeItem: (key) => {
				data.delete(key);
			}
		}));
		expect(storage.load()).toEqual(initialProgress());
		expect(storage.save(progress)).toBe(true);
		expect([...data.keys()]).toEqual([STORAGE_KEY]);
		expect(storage.load()).toEqual(progress);
		expect(storage.reset()).toBe(true);
		expect(storage.load()).toEqual(initialProgress());
	});
	it.each([
		null,
		'{',
		'null',
		'[]',
		'{"schemaVersion":999}',
		'{"schemaVersion":1,"totalXp":"NaN"}'
	])('recupera datos corruptos: %s', (raw) => {
		expect(parseProgress(raw)).toEqual(initialProgress());
	});
	it('rechaza contadores inconsistentes, fechas inválidas y esquema futuro', () => {
		expect(migrateProgress({ ...progress, totalXp: -10 })).toEqual(initialProgress());
		expect(migrateProgress({ ...progress, schemaVersion: 2 })).toEqual(initialProgress());
		expect(migrateProgress({ ...progress, questionsAnswered: 99 })).toEqual(initialProgress());
		expect(
			migrateProgress({
				...progress,
				conceptProgress: { honestidad: { attempts: 1, correct: 1, incorrect: 0, lastSeen: 'ayer' } }
			})
		).toEqual(initialProgress());
	});
	it('no propaga errores cuando el navegador bloquea almacenamiento', () => {
		const storage = new LocalStorageProgressStorage(() => {
			throw new Error('SecurityError');
		});
		expect(storage.load()).toEqual(initialProgress());
		expect(storage.save(progress)).toBe(false);
		expect(storage.reset()).toBe(false);
	});
	it('conserva dificultad y conceptos históricos sin depender del dataset', () => {
		expect(migrateProgress({ ...progress, selectedDifficulty: 4 })).toEqual({
			...progress,
			selectedDifficulty: 4
		});
	});
});
