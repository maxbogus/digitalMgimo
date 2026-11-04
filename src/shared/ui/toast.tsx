import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { create } from 'zustand';

import { cn } from '@/shared/lib/cn';

export type ToastVariant = 'success' | 'danger' | 'info';

interface ToastItem {
	id: number;
	title: string;
	description?: string;
	variant: ToastVariant;
}

interface ToastState {
	items: ToastItem[];
	push: (input: Omit<ToastItem, 'id'>) => void;
	dismiss: (id: number) => void;
}

const AUTO_DISMISS_MS = 4200;

const useToastStore = create<ToastState>((set, get) => ({
	items: [],
	push: (input) => {
		const id = Date.now() + Math.random();
		set({ items: [...get().items, { ...input, id }].slice(-3) });
		window.setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS);
	},
	dismiss: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
}));

/** Показать тост из любого места приложения. */
export function toast(input: {
	title: string;
	description?: string;
	variant?: ToastVariant;
}): void {
	useToastStore.getState().push({
		title: input.title,
		description: input.description,
		variant: input.variant ?? 'success',
	});
}

const VARIANT_STYLE: Record<ToastVariant, { icon: typeof Info; className: string }> = {
	success: { icon: CheckCircle2, className: 'text-success' },
	danger: { icon: TriangleAlert, className: 'text-danger' },
	info: { icon: Info, className: 'text-primary' },
};

/**
 * Контейнер тостов: aria-live, автоскрытие, не перекрывает нижнюю навигацию.
 */
export function Toaster() {
	const items = useToastStore((state) => state.items);
	const dismiss = useToastStore((state) => state.dismiss);
	const reduce = useReducedMotion();

	return (
		<div
			aria-live="polite"
			aria-atomic="false"
			className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
		>
			<AnimatePresence initial={false}>
				{items.map((item) => {
					const { icon: Icon, className } = VARIANT_STYLE[item.variant];
					return (
						<motion.div
							key={item.id}
							layout
							initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
							transition={{ type: 'spring', stiffness: 420, damping: 30 }}
							className="border-border bg-surface shadow-float pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-3.5"
						>
							<Icon className={cn('mt-0.5 size-5 shrink-0', className)} aria-hidden="true" />
							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold">{item.title}</p>
								{item.description ? (
									<p className="text-muted-foreground mt-0.5 text-xs leading-snug">
										{item.description}
									</p>
								) : null}
							</div>
							<button
								type="button"
								onClick={() => dismiss(item.id)}
								aria-label="Скрыть уведомление"
								className="text-muted-foreground hover:bg-surface-2 hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
							>
								<X className="size-4" aria-hidden="true" />
							</button>
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);
}
