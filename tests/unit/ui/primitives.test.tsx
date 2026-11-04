import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Mascot } from '@/shared/ui/mascot';
import { Progress, ProgressRing } from '@/shared/ui/progress';
import { Sheet } from '@/shared/ui/sheet';
import { Switch } from '@/shared/ui/switch';
import { Tabs } from '@/shared/ui/tabs';

describe('Button', () => {
	it('по умолчанию не отправляет форму и имеет тач-таргет 44px', () => {
		render(<Button>Заказать</Button>);
		const button = screen.getByRole('button', { name: 'Заказать' });
		expect(button).toHaveAttribute('type', 'button');
		expect(button.className).toContain('min-h-11');
	});
});

describe('Progress', () => {
	it('отдаёт значение и подпись для скринридера', () => {
		render(<Progress value={137} label="Прогресс: Статистика" />);
		const bar = screen.getByRole('progressbar', { name: 'Прогресс: Статистика' });
		expect(bar).toHaveAttribute('aria-valuenow', '100');
	});

	it('кольцо объявляет процент', () => {
		render(<ProgressRing value={40} label="Средний балл" />);
		expect(screen.getByRole('img', { name: 'Средний балл' })).toBeInTheDocument();
	});
});

describe('Mascot', () => {
	it('имеет текстовое описание для незрячих', () => {
		render(<Mascot mood="party" />);
		expect(screen.getByRole('img', { name: /Совёнок Дек/ })).toBeInTheDocument();
	});
});

describe('Switch', () => {
	it('переключается и сообщает состояние', async () => {
		const onChange = vi.fn();
		render(<Switch checked={false} onChange={onChange} label="Тёмная тема" />);

		const control = screen.getByRole('switch', { name: 'Тёмная тема' });
		expect(control).toHaveAttribute('aria-checked', 'false');

		await userEvent.click(control);
		expect(onChange).toHaveBeenCalledWith(true);
	});

	it('не реагирует, когда отключён', async () => {
		const onChange = vi.fn();
		render(<Switch checked onChange={onChange} label="Критичные" disabled />);

		const control = screen.getByRole('switch', { name: 'Критичные' });
		expect(control).toBeDisabled();
		await userEvent.click(control);
		expect(onChange).not.toHaveBeenCalled();
	});
});

describe('Tabs', () => {
	it('переключает активную вкладку', async () => {
		const onChange = vi.fn();
		render(
			<Tabs
				ariaLabel="Период"
				value="today"
				onChange={onChange}
				options={[
					{ value: 'today', label: 'Сегодня' },
					{ value: 'week', label: 'Неделя' },
				]}
			/>,
		);

		expect(screen.getByRole('tab', { name: 'Сегодня' })).toHaveAttribute('aria-selected', 'true');
		await userEvent.click(screen.getByRole('tab', { name: 'Неделя' }));
		expect(onChange).toHaveBeenCalledWith('week');
	});
});

describe('Sheet', () => {
	it('открывается как диалог и закрывается по Esc', async () => {
		const onClose = vi.fn();
		render(
			<Sheet open onClose={onClose} title="Новая заявка" description="Шаг 1 из 3">
				<p>Тело</p>
			</Sheet>,
		);

		expect(screen.getByRole('dialog', { name: 'Новая заявка' })).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		expect(onClose).toHaveBeenCalled();
	});

	it('не рендерится, когда закрыт', () => {
		render(
			<Sheet open={false} onClose={() => undefined} title="Новая заявка">
				<p>Тело</p>
			</Sheet>,
		);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});
});

describe('EmptyState', () => {
	it('предлагает действие вместо тупика', () => {
		render(
			<EmptyState
				title="Сегодня пар нет"
				description="Свободный день"
				action={<Button size="sm">Смотреть дедлайны</Button>}
			/>,
		);

		expect(screen.getByText('Сегодня пар нет')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Смотреть дедлайны' })).toBeInTheDocument();
	});
});
