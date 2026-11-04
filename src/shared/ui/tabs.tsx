import { cn } from '@/shared/lib/cn';

export interface TabOption<T extends string> {
	value: T;
	label: string;
	/** Числовой бейдж справа от подписи, например число непрочитанных. */
	count?: number;
}

interface TabsProps<T extends string> {
	options: TabOption<T>[];
	value: T;
	onChange: (value: T) => void;
	ariaLabel: string;
	className?: string;
	/** Растянуть вкладки на всю ширину (мобильный паттерн). */
	stretch?: boolean;
}

/**
 * Доступные вкладки: role=tablist + aria-selected, клавиатурная навигация браузера.
 */
export function Tabs<T extends string>({
	options,
	value,
	onChange,
	ariaLabel,
	className,
	stretch = false,
}: TabsProps<T>) {
	return (
		<div
			role="tablist"
			aria-label={ariaLabel}
			className={cn(
				'no-scrollbar border-border bg-surface flex gap-1 overflow-x-auto rounded-2xl border p-1',
				className,
			)}
		>
			{options.map((option) => {
				const active = option.value === value;
				return (
					<button
						key={option.value}
						type="button"
						role="tab"
						aria-selected={active}
						onClick={() => onChange(option.value)}
						className={cn(
							'flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors',
							active
								? 'bg-primary text-primary-foreground shadow-card'
								: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
							stretch && 'flex-1',
						)}
					>
						{option.label}
						{typeof option.count === 'number' && option.count > 0 ? (
							<span
								className={cn(
									'rounded-full px-1.5 text-[11px] leading-5',
									active ? 'bg-white/20' : 'bg-surface-2',
								)}
							>
								{option.count}
							</span>
						) : null}
					</button>
				);
			})}
		</div>
	);
}
