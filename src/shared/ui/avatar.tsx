import { cn } from '@/shared/lib/cn';

interface AvatarProps {
	name: string;
	gradient: [string, string];
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const SIZE_CLASS = {
	sm: 'size-9 text-xs',
	md: 'size-11 text-sm',
	lg: 'size-16 text-lg',
} as const;

/** Возвращает инициалы: «Ковалёва Анна» → «АК». */
export function initials(fullName: string): string {
	const parts = fullName.trim().split(/\s+/);
	const first = parts[0]?.charAt(0) ?? '';
	const second = parts[1]?.charAt(0) ?? '';
	return `${first}${second}`.toUpperCase();
}

/** Аватар с градиентом бренда и инициалами — без внешних картинок. */
export function Avatar({ name, gradient, size = 'md', className }: AvatarProps) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				'shadow-card inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white/60',
				SIZE_CLASS[size],
				className,
			)}
			style={{ backgroundImage: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
		>
			{initials(name)}
		</span>
	);
}
