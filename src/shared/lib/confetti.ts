/**
 * Праздничный, но короткий «взрыв» конфетти для успешных действий.
 * Уважает prefers-reduced-motion и грузится лениво, чтобы не тянуть вес в main-бандл.
 */
export async function celebrate(): Promise<void> {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const { default: confetti } = await import('canvas-confetti');
	const colors = ['#0D5BD7', '#8FE3C6', '#FFC9A8', '#C0A8FF', '#FFE28A'];

	confetti({
		particleCount: 70,
		spread: 64,
		startVelocity: 34,
		gravity: 0.9,
		ticks: 140,
		scalar: 0.9,
		origin: { y: 0.7 },
		colors,
		disableForReducedMotion: true,
	});
}
