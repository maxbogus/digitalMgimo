import { useEffect, useState } from 'react';

/**
 * Тикающее «сейчас» для обратных отсчётов.
 * Интервал по умолчанию 30 с — достаточно для «через 20 минут», без лишних рендеров.
 */
export function useNow(intervalMs = 30_000): Date {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), intervalMs);
		return () => window.clearInterval(timer);
	}, [intervalMs]);

	return now;
}
