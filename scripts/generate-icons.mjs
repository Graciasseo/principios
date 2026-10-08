import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
const svg = await readFile(new URL('../static/favicon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch();
await mkdir(new URL('../static/icons/', import.meta.url), { recursive: true });
for (const [name, size, scale] of [
	['icon-192', 192, 1],
	['icon-512', 512, 1],
	['maskable-512', 512, 0.8]
]) {
	const page = await browser.newPage({
		viewport: { width: size, height: size },
		deviceScaleFactor: 1
	});
	await page.setContent(
		`<style>html,body{margin:0;background:#254f42;width:100%;height:100%;overflow:hidden}svg{width:100%;height:100%;transform:scale(${scale})}</style>${svg}`
	);
	await page.screenshot({ path: new URL(`../static/icons/${name}.png`, import.meta.url).pathname });
	await page.close();
}
await browser.close();
