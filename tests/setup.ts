import '@testing-library/jest-dom/vitest';

/**
 * jsdom не реализует matchMedia, а `motion` использует его для prefers-reduced-motion.
 * Заглушка возвращает «анимации разрешены».
 */
if (!window.matchMedia) {
	window.matchMedia = (query: string): MediaQueryList =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => undefined,
			removeListener: () => undefined,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			dispatchEvent: () => false,
		}) as unknown as MediaQueryList;
}
