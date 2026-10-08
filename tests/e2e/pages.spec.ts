import { test, expect } from '@playwright/test';

test('publicación en subruta: navegación, manifest y modo offline', async ({ page, context }) => {
	const base = process.env.BASE_PATH ?? '';
	await page.goto(`${base}/`);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Lo que valoras');
	const manifestUrl = await page
		.locator('link[rel="manifest"]')
		.evaluate((el) => (el as HTMLLinkElement).href);
	const response = await page.request.get(manifestUrl);
	const manifest = await response.json();
	expect(new URL(manifest.start_url, manifestUrl).pathname).toBe(`${base}/`);
	for (const icon of manifest.icons) {
		const iconUrl = new URL(icon.src, manifestUrl);
		expect(iconUrl.pathname).toContain(`${base}/icons/`);
		expect((await page.request.get(iconUrl.href)).ok()).toBe(true);
	}
	await page.getByRole('button', { name: /Principio → Valor/ }).click();
	await page.getByRole('link', { name: /Empezar a jugar/ }).click();
	await expect(page.locator('.answer-option')).toHaveCount(3);
	expect(new URL(page.url()).pathname).toBe(`${base}/jugar/`);
	await page.locator('.answer-option').first().click();
	await expect(page.getByRole('status')).toBeVisible();
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
		if (!navigator.serviceWorker.controller) {
			await new Promise<void>((resolve) =>
				navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
					once: true
				})
			);
		}
	});
	await context.setOffline(true);
	await page.goto(`${base}/progreso/`);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await context.setOffline(false);
});
