import { defineConfig } from '@playwright/test';
export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	workers: 2,
	retries: process.env.CI ? 1 : 0,
	use: {
		baseURL: 'http://127.0.0.1:4183',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4183 --strictPort',
		url: `http://127.0.0.1:4183${process.env.BASE_PATH ?? ''}/`,
		reuseExistingServer: false,
		timeout: 120000
	},
	projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
});
