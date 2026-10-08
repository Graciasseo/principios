import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1400, height: 1000 },
	colorScheme: 'light'
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.goto('http://127.0.0.1:4173/');
await page.getByRole('heading', { level: 1 }).waitFor();
await page.screenshot({ path: 'artifacts/inicio-desktop.png', fullPage: true });
await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({ path: 'artifacts/inicio-mobile.png', fullPage: true });
await page.getByRole('link', { name: /Empezar a jugar/ }).click();
await page.locator('#question-title').waitFor();
await page.locator('.answer-option').first().click();
await page.getByRole('status').waitFor();
await page.screenshot({ path: 'artifacts/feedback-mobile.png', fullPage: true });
page.on('dialog', (dialog) => dialog.accept());
await page.getByRole('link', { name: /Mi progreso/ }).click();
await page.getByRole('heading', { name: 'Tu progreso.' }).waitFor();
await page.screenshot({ path: 'artifacts/progreso-mobile.png', fullPage: true });
await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
await page.screenshot({ path: 'artifacts/progreso-dark.png', fullPage: true });
console.log(JSON.stringify({ pageErrors: errors, screenshots: 5 }));
await browser.close();
if (errors.length) process.exitCode = 1;
