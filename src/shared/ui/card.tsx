import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

/** Карточка: основной контейнер контента, скругление 20 px, мягкая тень. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn('rounded-card border-border bg-surface shadow-card border', className)}
			{...props}
		/>
	);
}

/** Шапка карточки с отступами по умолчанию. */
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props} />;
}

/** Заголовок карточки. */
export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3 className={cn('text-base leading-snug font-semibold', className)} {...props}>
			{children}
		</h3>
	);
}

/** Пояснение под заголовком. */
export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

/** Контент карточки. */
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('p-5', className)} {...props} />;
}

/** Подвал карточки: действия или метаданные. */
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex items-center gap-2 p-5 pt-0', className)} {...props} />;
}
