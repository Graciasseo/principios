import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}` },
			version: { pollInterval: 0 }
		})
	],
	test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] }
});
