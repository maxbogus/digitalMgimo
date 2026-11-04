import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

/** Скелетон загрузки: показывает структуру, а не спиннер. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			aria-hidden="true"
			className={cn('rounded-control bg-surface-2 animate-pulse', className)}
			{...props}
		/>
	);
}

/** Скелетон списка карточек — для экранов расписания и заявок. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
	return (
		<div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
			{Array.from({ length: rows }, (_, index) => (
				<div key={index} className="rounded-card border-border bg-surface border p-5">
					<div className="flex items-center gap-3">
						<Skeleton className="size-11 rounded-2xl" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-3 w-2/3" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
