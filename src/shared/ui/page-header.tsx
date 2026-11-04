import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface PageHeaderProps {
	title: string;
	description?: string;
	actions?: ReactNode;
	className?: string;
}

/** Заголовок экрана: один h1 на страницу, действия справа. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
	return (
		<header
			className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}
		>
			<div className="flex flex-col gap-1">
				<h1 className="text-[26px] leading-tight font-bold tracking-tight sm:text-3xl">{title}</h1>
				{description ? (
					<p className="text-muted-foreground max-w-2xl text-sm sm:text-[15px]">{description}</p>
				) : null}
			</div>
			{actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
		</header>
	);
}
