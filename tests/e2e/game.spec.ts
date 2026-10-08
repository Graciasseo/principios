import { test, expect, type Page } from '@playwright/test';
import values from '../../src/lib/content/values.json' with { type: 'json' };
import principles from '../../src/lib/content/principles.json' with { type: 'json' };
const names = new Set(values.map((v) => v.name));
async function answerCategory(page: Page) {
	const prompt = await page.locator('#question-title').innerText();
	await page
		.getByRole('button', { name: names.has(prompt) ? /^1?\s*Valor$/ : /^2?\s*Principio$/ })
		.click();
}
async function noOverflow(page: Page) {
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);
}

test('inicio, selección de modo, respuesta, feedback y continuación', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Lo que valoras');
	await page.getByRole('button', { name: /Principio → Valor/ }).click();
	await page.getByLabel('Dificultad').selectOption('3');
	await page.getByRole('link', { name: /Empezar a jugar/ }).click();
	await expect(page.locator('.answer-option')).toHaveCount(4);
	await page.locator('.answer-option').first().click();
	await expect(page.getByRole('status')).toBeVisible();
	await expect(page.locator('.answer-option.correct')).toHaveCount(1);
	for (const option of await page.locator('.answer-option').all())
		await expect(option).toBeDisabled();
	await page.getByRole('button', { name: /Continuar/ }).click();
	await expect(page.getByText('Pregunta 2 de 10')).toBeVisible();
});

for (const mode of ['valor-principio', 'principio-valor', 'valor-principio-regla', 'mixto']) {
	test(`completa diez preguntas en ${mode}`, async ({ page }) => {
		await page.goto(`/jugar/?modo=${mode}&dificultad=4`);
		for (let i = 1; i <= 10; i++) {
			await expect(page.getByText(`Pregunta ${i} de 10`)).toBeVisible();
			await page.locator('.answer-option').first().click();
			await expect(page.getByRole('status')).toBeVisible();
			await page.getByRole('button', { name: i === 10 ? /Ver mi resumen/ : /Continuar/ }).click();
		}
		await expect(page.getByText('Partida completada', { exact: true })).toBeVisible();
		await page
			.getByRole('link', { name: /Mi progreso/ })
			.first()
			.click();
		await expect(page.getByTestId('games-played')).toHaveText('1');
	});
}

test('XP persiste tras recargar; cancelación y confirmación de reset', async ({ page }) => {
	await page.goto('/jugar/?modo=valor-principio');
	await answerCategory(page);
	await expect(page.getByTestId('xp')).toHaveText('10 XP');
	page.on('dialog', (dialog) => dialog.accept());
	await page.reload();
	await expect(page.getByTestId('xp')).toHaveText('10 XP');
	await page.getByRole('link', { name: /Mi progreso/ }).click();
	await expect(page.getByTestId('total-xp')).toHaveText('10');
	await page.getByRole('button', { name: 'Reiniciar progreso' }).click();
	await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
	await expect(page.getByTestId('total-xp')).toHaveText('10');
	await page.getByRole('button', { name: 'Reiniciar progreso' }).click();
	await page.getByRole('button', { name: 'Borrar progreso', exact: true }).click();
	await expect(page.getByTestId('total-xp')).toHaveText('0');
	await page.reload();
	await expect(page.getByTestId('total-xp')).toHaveText('0');
	await expect(page.getByText('Aún tienes todo por descubrir.')).toBeVisible();
});

test('teclado: números, Enter, foco y protección contra repetición', async ({ page }) => {
	await page.goto('/jugar/?modo=principio-valor&dificultad=4');
	await expect(page.locator('#question-title')).toBeVisible();
	await page.keyboard.press('1');
	await expect(page.getByRole('status')).toBeVisible();
	await expect(page.getByRole('button', { name: /Continuar/ })).toBeFocused();
	await page.keyboard.press('2');
	await page.keyboard.press('Enter');
	await expect(page.getByText('Pregunta 2 de 10')).toBeVisible();
	await expect(page.locator('#question-title')).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.getByText('Pregunta 2 de 10')).toBeVisible();
});

for (const width of [320, 375, 1280])
	test(`juego y progreso sin desbordamiento a ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 812 });
		await page.goto('/');
		await noOverflow(page);
		await page.getByRole('button', { name: /Valor → Principio/ }).click();
		await page.getByRole('link', { name: /Empezar a jugar/ }).click();
		await noOverflow(page);
		await page.locator('.answer-option').first().click();
		await expect(page.getByRole('status')).toBeVisible();
		await noOverflow(page);
		page.on('dialog', (dialog) => dialog.accept());
		await page.getByRole('link', { name: /Mi progreso/ }).click();
		await noOverflow(page);
	});

test('PWA precachea las tres rutas tras visitar únicamente el inicio y funciona offline', async ({
	page,
	context,
	baseURL
}) => {
	const external: string[] = [];
	page.on('request', (req) => {
		if (new URL(req.url()).origin !== new URL(baseURL!).origin) external.push(req.url());
	});
	await page.goto('/');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
		if (!navigator.serviceWorker.controller)
			await new Promise<void>((resolve) =>
				navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
					once: true
				})
			);
	});
	await context.setOffline(true);
	await page.goto('/progreso/');
	await expect(page.getByRole('heading', { name: 'Tu progreso.' })).toBeVisible();
	await page.goto('/jugar/?modo=valor-principio&dificultad=2');
	await answerCategory(page);
	await expect(page.getByTestId('xp')).toHaveText('10 XP');
	page.on('dialog', (dialog) => dialog.accept());
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Lo que valoras');
	expect(external).toEqual([]);
});

test('almacenamiento corrupto y bloqueado no rompen el juego', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('principios-progress', '{corrupto'));
	await page.goto('/progreso/');
	await expect(page.getByTestId('total-xp')).toHaveText('0');
	await page.addInitScript(() =>
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new Error('Bloqueado');
			}
		})
	);
	await page.goto('/jugar/?modo=valor-principio');
	await answerCategory(page);
	await expect(page.getByTestId('xp')).toHaveText('10 XP');
	await expect(page.getByText(/No se puede guardar en este navegador/)).toBeVisible();
});

test('cancelar la salida conserva la pregunta; salir conserva respuestas', async ({ page }) => {
	await page.goto('/jugar/?modo=valor-principio');
	await answerCategory(page);
	const cancelDialog = page.waitForEvent('dialog');
	const cancelClick = page.getByRole('link', { name: 'Salir de la partida' }).click();
	await (await cancelDialog).dismiss();
	await cancelClick;
	await expect(page.getByTestId('xp')).toHaveText('10 XP');
	const acceptDialog = page.waitForEvent('dialog');
	const acceptClick = page.getByRole('link', { name: 'Salir de la partida' }).click();
	await (await acceptDialog).accept();
	await acceptClick;
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Lo que valoras');
	await page.getByRole('link', { name: /Mi progreso/ }).click();
	await expect(page.getByTestId('total-xp')).toHaveText('10');
	await expect(page.getByTestId('games-played')).toHaveText('0');
});

test('valor correcto del dataset obtiene XP y feedback pedagógico', async ({ page }) => {
	await page.goto('/jugar/?modo=principio-valor&dificultad=4');
	await expect(page.locator('#question-title')).toBeVisible();
	const prompt = await page.locator('#question-title').innerText();
	const principle = principles.find((p) => p.text === prompt)!;
	const value = values.find((v) => v.id === principle.primaryValueId)!;
	await page.getByRole('button', { name: new RegExp(value.name + '$') }).click();
	await expect(page.getByRole('heading', { name: '✓ Correcto' })).toBeVisible();
	await expect(page.getByTestId('xp')).toHaveText('10 XP');
	await expect(page.getByRole('status')).toContainText(principle.explanation);
});

test('catálogo ampliado conserva progreso V1 y muestra nuevos conceptos sin reflexiones en pantalla', async ({
	page
}) => {
	await page.addInitScript(() =>
		localStorage.setItem(
			'principios-progress',
			JSON.stringify({
				schemaVersion: 1,
				totalXp: 10,
				gamesPlayed: 0,
				questionsAnswered: 1,
				correctAnswers: 1,
				incorrectAnswers: 0,
				currentStreak: 1,
				bestStreak: 1,
				selectedDifficulty: 3,
				conceptProgress: {
					honestidad: {
						attempts: 1,
						correct: 1,
						incorrect: 0,
						lastSeen: '2026-10-07T18:00:00.000Z'
					}
				}
			})
		)
	);
	await page.goto('/progreso/');
	await expect(page.locator('.mastery-item')).toHaveCount(values.length);
	await expect(page.getByRole('heading', { name: 'Compasión', exact: true })).toBeVisible();
	await expect(page.getByTestId('total-xp')).toHaveText('10');
	await expect(
		page
			.locator('.mastery-item')
			.filter({ has: page.getByRole('heading', { name: 'Honestidad', exact: true }) })
	).toContainText('1 / 1 correctas');
	await page.goto('/jugar/?modo=principio-valor&dificultad=3');
	await page.locator('.answer-option').first().click();
	const feedback = page.getByRole('status');
	await expect(feedback).toBeVisible();
	await expect(feedback).not.toContainText('Para reflexionar');
});
