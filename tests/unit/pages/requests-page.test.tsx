import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from '@/app/store/app.store';
import { RequestsPage } from '@/pages/requests-page';
import { NOTIFICATIONS_SEED, REQUESTS_SEED } from '@/shared/api/mock';

function renderRequests() {
	return render(
		<MemoryRouter>
			<RequestsPage />
		</MemoryRouter>,
	);
}

describe('RequestsPage', () => {
	beforeEach(() => {
		useAppStore.setState({
			studentId: 'student-1',
			requests: REQUESTS_SEED,
			notifications: NOTIFICATIONS_SEED,
			channels: { critical: true, important: true, info: true },
		});
	});

	it('показывает заявки со статусом и ответственным', () => {
		renderRequests();

		expect(screen.getByRole('heading', { level: 1, name: 'Заявки и справки' })).toBeInTheDocument();
		expect(screen.getByText(/REQ-2418/)).toBeInTheDocument();
		expect(screen.getAllByText('Учебный отдел · окно 2').length).toBeGreaterThan(0);
		expect(screen.getByTitle(/подписан ЭЦП/)).toBeInTheDocument();
	});

	it('не показывает заявки другого студента', () => {
		renderRequests();
		expect(screen.queryByText('REQ-1907')).not.toBeInTheDocument();
	});

	it('открывает форму заявки и переводит на шаг подтверждения', async () => {
		renderRequests();

		await userEvent.click(screen.getByRole('button', { name: 'Новая заявка' }));
		expect(screen.getByRole('dialog', { name: 'Новая заявка' })).toBeInTheDocument();
		expect(screen.getByText(/Шаг 1 из 3/)).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: /Справка об обучении/ }));
		await userEvent.click(screen.getByRole('button', { name: 'Далее' }));

		expect(screen.getByText(/Шаг 2 из 3/)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeInTheDocument();
		expect(screen.getByText('Ковалёва Анна Дмитриевна')).toBeInTheDocument();
	});
});
