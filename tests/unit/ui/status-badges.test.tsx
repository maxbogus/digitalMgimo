import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RequestStatusBadge, RequestStepper } from '@/entities/request/ui/request-status';
import { PriorityBadge } from '@/entities/notification/ui/priority-badge';
import { Badge } from '@/shared/ui/badge';

describe('RequestStatusBadge', () => {
	it('показывает статус текстом, а не только цветом', () => {
		render(<RequestStatusBadge status="in-progress" />);
		expect(screen.getByText('В работе')).toBeInTheDocument();
	});
});

describe('RequestStepper', () => {
	it('объясняет статус для скринридера', () => {
		render(<RequestStepper status="ready" />);
		expect(screen.getByRole('list', { name: 'Статус заявки: Готова' })).toBeInTheDocument();
	});
});

describe('PriorityBadge', () => {
	it('маркирует критичные уведомления', () => {
		render(<PriorityBadge priority="critical" />);
		expect(screen.getByText('Критично')).toBeInTheDocument();
	});
});

describe('Badge', () => {
	it('рендерит текст и класс варианта', () => {
		render(<Badge variant="success">проверено</Badge>);
		const badge = screen.getByText('проверено');
		expect(badge).toHaveClass('bg-success-soft');
	});
});
