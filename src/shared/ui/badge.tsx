import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

const badgeVariants = cva(
	'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] leading-none font-semibold whitespace-nowrap',
	{
		variants: {
			variant: {
				primary: 'bg-primary-soft text-primary',
				success: 'bg-success-soft text-success',
				warning: 'bg-warning-soft text-warning',
				danger: 'bg-danger-soft text-danger',
				lilac: 'bg-lilac-soft text-lilac',
				muted: 'bg-surface-2 text-muted-foreground',
				outline: 'border border-border bg-transparent text-muted-foreground',
			},
		},
		defaultVariants: { variant: 'muted' },
	},
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

/**
 * Статусный бейдж. Всегда содержит текст: цвет — не единственный носитель смысла
 * (требование ГОСТ Р 52872-2019 / WCAG).
 */
export function Badge({ className, variant, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
