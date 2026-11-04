import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { cpSync, copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
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
 * Статические артефакты рядом с приложением: дека и описание процесса.
 *
 * Почему плагином, а не отдельным шагом CI: `make build` и деплой должны
 * давать одинаковый `dist/`, иначе локальная проверка ничего не доказывает.
 * Слайды — reveal.js из `node_modules` (вендорим, чтобы дека не зависела
 * от CDN и работала офлайн), PDF и скриншоты — из `docs/handout`.
 */
function staticExtras(): Plugin {
	const root = fileURLToPath(new URL('.', import.meta.url));
	const dist = fileURLToPath(new URL('./dist', import.meta.url));

	return {
		name: 'static-extras',
		apply: 'build',
		closeBundle() {
			const revealDist = join(root, 'node_modules', 'reveal.js', 'dist');
			if (existsSync(revealDist)) {
				cpSync(revealDist, join(dist, 'slides', 'vendor'), { recursive: true });
			}

			const slides = join(root, 'slides');
			if (existsSync(slides)) {
				cpSync(slides, join(dist, 'slides'), { recursive: true });
			}

			const handout = join(root, 'docs', 'handout');
			mkdirSync(join(dist, 'handout'), { recursive: true });
			for (const name of ['description.pdf', 'presentation.pdf']) {
				const source = join(handout, name);
				if (existsSync(source)) {
					copyFileSync(source, join(dist, 'handout', name));
				}
			}
			const images = join(handout, 'img');
			if (existsSync(images)) {
				cpSync(images, join(dist, 'handout', 'img'), { recursive: true });
			}
		},
	};
}

/**
 * Сборка прототипа: SPA без SSR — данные мок-слоя, деплой статикой.
 * `BASE_URL` позволяет собрать под подпапку (GitHub Pages: BASE_URL=/digitalMgimo/).
 */
export default defineConfig({
	base: process.env.BASE_URL ?? '/',
	plugins: [react(), tailwindcss(), pagesFallback(), staticExtras()],
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
