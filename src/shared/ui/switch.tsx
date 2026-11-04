import { cn } from '@/shared/lib/cn';

interface SwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
	description?: string;
	disabled?: boolean;
}

/**
 * Переключатель с областью нажатия 44 px и role=switch (доступность).
 */
export function Switch({ checked, onChange, label, description, disabled = false }: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={description ? `${label}. ${description}` : label}
			disabled={disabled}
			onClick={() => onChange(!checked)}
			className={cn(
				'group rounded-control flex min-h-11 w-full items-center justify-between gap-4 px-1 py-1 text-left',
				'focus-visible:ring-ring/25 focus-visible:ring-4 focus-visible:outline-none',
				disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
			)}
		>
			<span className="flex flex-col gap-0.5">
				<span className="text-foreground text-sm font-semibold">{label}</span>
				{description ? (
					<span className="text-muted-foreground text-xs leading-snug">{description}</span>
				) : null}
			</span>
			<span
				aria-hidden="true"
				className={cn(
					'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
					checked ? 'bg-primary' : 'bg-border',
				)}
			>
				<span
					className={cn(
						'absolute size-5 rounded-full bg-white shadow-sm transition-transform duration-200',
						checked ? 'translate-x-6' : 'translate-x-1',
					)}
				/>
			</span>
		</button>
	);
}
