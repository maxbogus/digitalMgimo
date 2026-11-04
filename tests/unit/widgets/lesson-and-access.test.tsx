import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LessonCard } from '@/entities/lesson/ui/lesson-card';
import type { Lesson } from '@/shared/api/types';
import { AccessMap } from '@/widgets/access-map';

const lessonWithChange: Lesson = {
	id: 'l-1',
	studentId: 'student-1',
	weekday: 2,
	start: '15:00',
	end: '16:20',
	subject: 'Международная торговля',
	kind: 'lecture',
	room: '214',
	teacher: 'проф. Н. А. Белова',
	change: {
		previousStart: '13:30',
		previousEnd: '14:50',
		reason: 'преподаватель на конференции',
	},
};

describe('LessonCard', () => {
	it('показывает старое время и причину переноса', () => {
		render(<LessonCard lesson={lessonWithChange} />);

		expect(screen.getByText(/13:30–14:50/)).toBeInTheDocument();
		expect(screen.getByText('изменено')).toBeInTheDocument();
		expect(screen.getByText(/преподаватель на конференции/)).toBeInTheDocument();
	});

	it('не показывает бейдж изменения для обычной пары', () => {
		render(<LessonCard lesson={{ ...lessonWithChange, change: undefined }} />);
		expect(screen.queryByText('изменено')).not.toBeInTheDocument();
	});
});

describe('AccessMap', () => {
	it('по умолчанию не передаёт данные в государственный контур', () => {
		render(<AccessMap />);

		expect(screen.getByRole('table', { name: /Матрица/ })).toBeInTheDocument();
		// Колонка «Гос. контур» целиком «не видит»: 6 строк.
		expect(screen.getAllByText('не видит').length).toBeGreaterThanOrEqual(6);
	});

	it('переключатель добавляет агрегаты в государственный контур', async () => {
		render(<AccessMap />);

		const before = screen.getAllByText('видит частично').length;
		await userEvent.click(screen.getByRole('switch', { name: /государственный контур/ }));
		const after = screen.getAllByText('видит частично').length;

		expect(after).toBeGreaterThan(before);
	});
});
