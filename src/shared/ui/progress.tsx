import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type ProgressTone = 'primary' | 'success' | 'warning' | 'lilac';

const TONE_CLASS: Record<ProgressTone, string> = {
	primary: 'bg-primary',
	success: 'bg-success',
	warning: 'bg-warning',
	lilac: 'bg-lilac',
};

interface ProgressProps {
	value: number;
	tone?: ProgressTone;
	label?: string;
	className?: string;
	/** Толщина полосы в px. */
	height?: number;
}

/**
 * Линейный прогресс с анимацией. Дублирует значение текстом у вызывающего кода,
 * чтобы прогресс не был «только цветом».
 */
export function Progress({ value, tone = 'primary', label, className, height = 8 }: ProgressProps) {
	const clamped = Math.min(100, Math.max(0, Math.round(value)));
	const reduce = useReducedMotion();

	return (
		<div
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={clamped}
			aria-label={label}
			className={cn('bg-surface-2 w-full overflow-hidden rounded-full', className)}
			style={{ height }}
		>
			<motion.div
				className={cn('h-full rounded-full', TONE_CLASS[tone])}
				initial={reduce ? false : { width: 0 }}
				animate={{ width: `${clamped}%` }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			/>
		</div>
	);
}

interface ProgressRingProps {
	value: number;
	size?: number;
	stroke?: number;
	tone?: ProgressTone;
	children?: ReactNode;
	label?: string;
}

/**
 * Круговой индикатор для главного числа экрана (средний балл, прогресс семестра).
 */
export function ProgressRing({
	value,
	size = 104,
	stroke = 9,
	tone = 'primary',
	children,
	label,
}: ProgressRingProps) {
	const clamped = Math.min(100, Math.max(0, value));
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const reduce = useReducedMotion();

	const strokeColor: Record<ProgressTone, string> = {
		primary: 'var(--primary)',
		success: 'var(--success)',
		warning: 'var(--warning)',
		lilac: 'var(--lilac)',
	};

	return (
		<div
			className="relative inline-flex items-center justify-center"
			style={{ width: size, height: size }}
			role="img"
			aria-label={label ?? `Прогресс: ${clamped}%`}
		>
			<svg width={size} height={size} className="-rotate-90" aria-hidden="true">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="var(--border)"
					strokeWidth={stroke}
				/>
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={strokeColor[tone]}
					strokeWidth={stroke}
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={reduce ? false : { strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: circumference - (circumference * clamped) / 100 }}
					transition={{ duration: 0.9, ease: 'easeOut' }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
				{children}
			</div>
		</div>
	);
}
