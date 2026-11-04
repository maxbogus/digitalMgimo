import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from '@/app/store/app.store';
import { TodayPage } from '@/pages/today-page';
import { NOTIFICATIONS_SEED, REQUESTS_SEED } from '@/shared/api/mock';

function renderToday() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
	});

	return render(
		<QueryClientProvider client={client}>
			<MemoryRouter>
				<TodayPage />
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

describe('TodayPage', () => {
	beforeEach(() => {
		useAppStore.setState({
			studentId: 'student-1',
			requests: REQUESTS_SEED,
			notifications: NOTIFICATIONS_SEED,
			channels: { critical: true, important: true, info: true },
		});
	});

	it('приветствует студента и показывает ленту дня', async () => {
		renderToday();

		expect(screen.getByRole('heading', { level: 1, name: /Анна/ })).toBeInTheDocument();

		expect(await screen.findByRole('heading', { name: 'Лента дня' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Дедлайны недели' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Требует внимания' })).toBeInTheDocument();
	});

	it('показывает либо пары, либо честное пустое состояние', async () => {
		renderToday();

		await screen.findByRole('heading', { name: 'Лента дня' });

		await waitFor(() => {
			const articles = screen.queryAllByRole('article');
			const emptyState = screen.queryByText('Сегодня пар нет');
			expect(articles.length > 0 || emptyState !== null).toBe(true);
		});
	});

	it('выводит критичные уведомления с текстом, а не только цветом', async () => {
		renderToday();

		const critical = await screen.findAllByText('Критично');
		expect(critical.length).toBeGreaterThan(0);
	});
});
