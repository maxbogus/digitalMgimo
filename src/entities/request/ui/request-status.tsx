import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';

import type { RequestStatus } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/cn';

interface StatusMeta {
	label: string;
	variant: 'primary' | 'warning' | 'success' | 'danger';
	icon: ComponentType<{ className?: string }>;
	/** Индекс шага в трекере: 0 — отправлена, 1 — в работе, 2 — готова. */
	step: number;
}

export const REQUEST_STATUS_META: Record<RequestStatus, StatusMeta> = {
	submitted: { label: 'Отправлена', variant: 'primary', icon: Clock3, step: 0 },
	'in-progress': { label: 'В работе', variant: 'warning', icon: Clock3, step: 1 },
	ready: { label: 'Готова', variant: 'success', icon: CheckCircle2, step: 2 },
	rejected: { label: 'Отклонена', variant: 'danger', icon: XCircle, step: 2 },
};

const STEPS = ['Отправлена', 'В работе', 'Готова'] as const;

/** Бейдж статуса заявки. */
export function RequestStatusBadge({ status }: { status: RequestStatus }) {
	const meta = REQUEST_STATUS_META[status];
	const Icon = meta.icon;

	return (
		<Badge variant={meta.variant}>
			<Icon className="size-3.5" />
			{meta.label}
		</Badge>
	);
}

/**
 * Трекер заявки «как доставка»: три шага, текущий выделен, пройденные отмечены.
 * Дублируется текстовым бейджем статуса — не только цвет.
 */
export function RequestStepper({ status }: { status: RequestStatus }) {
	const meta = REQUEST_STATUS_META[status];
	const rejected = status === 'rejected';

	return (
		<ol className="flex items-center gap-1.5" aria-label={`Статус заявки: ${meta.label}`}>
			{STEPS.map((step, index) => {
				const done = !rejected && index < meta.step;
				const current = !rejected && index === meta.step;
				const failed = rejected && index === 2;

				return (
					<li key={step} className="flex flex-1 items-center gap-1.5">
						<span
							className={cn(
								'inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
								done && 'bg-success text-white',
								current && 'bg-primary text-primary-foreground',
								failed && 'bg-danger text-white',
								!done && !current && !failed && 'bg-surface-2 text-muted-foreground',
							)}
						>
							{done ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : index + 1}
						</span>
						<span
							className={cn(
								'text-[11px] leading-tight',
								current ? 'text-foreground font-semibold' : 'text-muted-foreground',
							)}
						>
							{failed ? 'Отклонена' : step}
						</span>
						{index < STEPS.length - 1 ? (
							<span
								aria-hidden="true"
								className={cn('h-px flex-1 rounded-full', done ? 'bg-success/60' : 'bg-border')}
							/>
						) : null}
					</li>
				);
			})}
		</ol>
	);
}
