import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
	[
		'inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-control',
		'text-[15px] font-semibold leading-none whitespace-nowrap',
		'transition-[transform,background-color,color,box-shadow,border-color] duration-150',
		'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25',
		'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
	].join(' '),
	{
		variants: {
			variant: {
				primary: 'bg-primary text-primary-foreground shadow-card hover:bg-primary-hover',
				secondary: 'border border-border bg-surface text-foreground shadow-card hover:bg-surface-2',
				soft: 'bg-primary-soft text-primary hover:bg-primary-soft/70',
				ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
				success: 'bg-success text-white shadow-card hover:brightness-110',
				danger: 'bg-danger text-white shadow-card hover:brightness-110',
			},
			size: {
				sm: 'h-10 min-h-10 px-3 text-[13px]',
				md: 'h-11 px-4',
				lg: 'h-12 px-5 text-base',
				icon: 'size-11 min-h-11 p-0',
			},
			block: {
				true: 'w-full',
			},
		},
		defaultVariants: { variant: 'primary', size: 'md' },
	},
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {
		children?: ReactNode;
	};

/**
 * Кнопка дизайн-системы. Минимальная высота 44 px — требование ГОСТ по тач-таргетам.
 */
export function Button({
	className,
	variant,
	size,
	block,
	type = 'button',
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={cn(buttonVariants({ variant, size, block }), className)}
			{...props}
		/>
	);
}
