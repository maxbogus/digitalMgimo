import { RotateCcw } from 'lucide-react';

import { Button } from './button';
import { Mascot } from './mascot';

interface ErrorStateProps {
	title?: string;
	description?: string;
	onRetry?: () => void;
}

/**
 * Состояние ошибки: понятный текст + повтор запроса. Используется в мок-слое
 * и в «режиме демо-сбоев».
 */
export function ErrorState({
	title = 'Не удалось загрузить данные',
	description = 'Похоже, связь с сервером прервалась. Данные не потеряны — попробуйте ещё раз.',
	onRetry,
}: ErrorStateProps) {
	return (
		<div
			role="alert"
			className="rounded-card border-danger/25 bg-danger-soft flex flex-col items-center gap-3 border px-5 py-8 text-center"
		>
			<Mascot mood="sad" size={92} />
			<h3 className="text-foreground text-base font-semibold">{title}</h3>
			<p className="text-foreground/80 max-w-sm text-sm">{description}</p>
			{onRetry ? (
				<Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
					<RotateCcw className="size-4" aria-hidden="true" />
					Повторить
				</Button>
			) : null}
		</div>
	);
}
