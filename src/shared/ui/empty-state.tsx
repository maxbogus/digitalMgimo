import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Mascot, type MascotMood } from './mascot';

interface EmptyStateProps {
	title: string;
	description: string;
	mood?: MascotMood;
	action?: ReactNode;
	className?: string;
}

/**
 * Пустое состояние — не тупик, а предложение действия (требование ТЗ).
 */
export function EmptyState({
	title,
	description,
	mood = 'curious',
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				'rounded-card border-border bg-surface/60 flex flex-col items-center gap-3 border border-dashed px-5 py-10 text-center',
				className,
			)}
		>
			<Mascot mood={mood} size={104} />
			<h3 className="text-base font-semibold">{title}</h3>
			<p className="text-muted-foreground max-w-sm text-sm">{description}</p>
			{action ? <div className="mt-1">{action}</div> : null}
		</div>
	);
}
