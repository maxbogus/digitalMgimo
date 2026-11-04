import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface SheetProps {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: ReactNode;
	footer?: ReactNode;
	className?: string;
}

/**
 * Модальное окно-«шит»: на мобилке выезжает снизу, на десктопе — по центру.
 * Закрывается по Esc и клику по подложке, блокирует скролл страницы.
 */
export function Sheet({
	open,
	onClose,
	title,
	description,
	children,
	footer,
	className,
}: SheetProps) {
	const titleId = useId();
	const descriptionId = useId();
	const panelRef = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();

	useEffect(() => {
		if (!open) return;

		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', handleKey);
		panelRef.current?.focus();

		return () => {
			document.removeEventListener('keydown', handleKey);
			document.body.style.overflow = previousOverflow;
		};
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open ? (
				<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
					<motion.div
						aria-hidden="true"
						onClick={onClose}
						className="absolute inset-0 bg-[#07121F]/50 backdrop-blur-[2px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18 }}
					/>
					<motion.div
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						aria-describedby={description ? descriptionId : undefined}
						tabIndex={-1}
						initial={reduce ? false : { y: 48, opacity: 0, scale: 0.98 }}
						animate={{ y: 0, opacity: 1, scale: 1 }}
						exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.99 }}
						transition={{ type: 'spring', stiffness: 380, damping: 32 }}
						className={cn(
							'border-border bg-surface relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto border',
							'rounded-t-sheet shadow-float p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]',
							'sm:rounded-card sm:pb-5',
							className,
						)}
					>
						<div className="mb-4 flex items-start justify-between gap-4">
							<div className="flex flex-col gap-1">
								<h2 id={titleId} className="text-lg leading-tight font-bold">
									{title}
								</h2>
								{description ? (
									<p id={descriptionId} className="text-muted-foreground text-sm">
										{description}
									</p>
								) : null}
							</div>
							<button
								type="button"
								onClick={onClose}
								aria-label="Закрыть"
								className="text-muted-foreground hover:bg-surface-2 hover:text-foreground focus-visible:ring-ring/25 inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
							>
								<X className="size-5" aria-hidden="true" />
							</button>
						</div>

						{children}

						{footer ? (
							<div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
								{footer}
							</div>
						) : null}
					</motion.div>
				</div>
			) : null}
		</AnimatePresence>
	);
}
