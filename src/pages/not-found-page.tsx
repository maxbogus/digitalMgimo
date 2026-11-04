import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/shared/ui/empty-state';

/** 404: не «страница не найдена», а понятный следующий шаг. */
export function NotFoundPage() {
	return (
		<div className="mx-auto max-w-lg py-10">
			<EmptyState
				mood="sad"
				title="Такой страницы нет"
				description="Возможно, ссылка устарела или в адресе опечатка. Вернитесь на главную — там всё, что нужно на сегодня."
				action={
					<Link
						to="/"
						className="rounded-control bg-primary text-primary-foreground shadow-card hover:bg-primary-hover focus-visible:ring-ring/25 inline-flex min-h-11 items-center gap-1.5 px-4 text-sm font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none"
					>
						<ArrowLeft className="size-4" aria-hidden="true" />
						На главную
					</Link>
				}
			/>
		</div>
	);
}
