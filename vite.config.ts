import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

/**
 * GitHub Pages: SPA-fallback и отключение Jekyll.
 *
 * `404.html` — точная копия `index.html`: так любой deep link (например
 * `/digitalMgimo/schedule`) отдаёт приложение, а маршрут разбирает BrowserRouter
 * с basename. Файл генерируется при сборке, а не лежит в `public/`, чтобы его
 * содержимое не расходилось с текущим `index.html`.
 */
function pagesFallback(): Plugin {
	const dist = fileURLToPath(new URL('./dist', import.meta.url));

	return {
		name: 'pages-spa-fallback',
		apply: 'build',
		closeBundle() {
			copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
			writeFileSync(join(dist, '.nojekyll'), '');
		},
	};
}

/**
 * Сборка прототипа: SPA без SSR — данные мок-слоя, деплой статикой.
 * `BASE_URL` позволяет собрать под подпапку (GitHub Pages: BASE_URL=/digitalMgimo/).
 */
export default defineConfig({
	base: process.env.BASE_URL ?? '/',
	plugins: [react(), tailwindcss(), pagesFallback()],
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
