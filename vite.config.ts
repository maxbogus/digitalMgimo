import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

/**
 * Сборка прототипа: SPA без SSR — данные мок-слоя, деплой статикой.
 * `BASE_URL` позволяет собрать под подпапку (GitHub Pages: BASE_URL=/digitalMgimo/).
 */
export default defineConfig({
	base: process.env.BASE_URL ?? '/',
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	server: {
		port: 5173,
		host: true,
	},
	build: {
		target: 'es2022',
		chunkSizeWarningLimit: 700,
	},
});
