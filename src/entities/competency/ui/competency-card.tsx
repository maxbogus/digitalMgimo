import { BadgeCheck, BriefcaseBusiness, Clock3 } from 'lucide-react';

import type { Competency } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';

const STATUS_META = {
	verified: { label: 'Подтверждено', variant: 'success' as const },
	pending: { label: 'На проверке', variant: 'warning' as const },
	'not-started': { label: 'Не изучено', variant: 'muted' as const },
};

interface CompetencyCardProps {
	competency: Competency;
}

/**
 * Карточка навыка: уровень, статус верификации и рыночный сигнал.
 * Уровень продублирован текстом — не только полосой.
 */
export function CompetencyCard({ competency }: CompetencyCardProps) {
	const status = STATUS_META[competency.status];

	return (
		<article className="rounded-card border-border bg-surface shadow-card border p-4">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<div className="min-w-0">
					<h3 className="text-[15px] leading-snug font-semibold">{competency.name}</h3>
					<p className="text-muted-foreground mt-0.5 text-xs">{competency.discipline}</p>
				</div>
				<Badge variant={status.variant}>
					{competency.status === 'verified' ? <BadgeCheck className="size-3.5" /> : null}
					{status.label}
				</Badge>
			</div>

			<div className="mt-3 flex items-center gap-3">
				<Progress
					value={competency.level}
					tone={
						competency.status === 'verified'
							? 'success'
							: competency.status === 'pending'
								? 'warning'
								: 'primary'
					}
					label={`Уровень: ${competency.name}`}
					className="flex-1"
				/>
				<span className="tabular w-10 text-right text-xs font-semibold">{competency.level} %</span>
			</div>

			{competency.market ? (
				<div className="border-border text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs">
					<span className="inline-flex items-center gap-1.5">
						<BriefcaseBusiness className="size-3.5" aria-hidden="true" />В{' '}
						{competency.market.vacancies.toLocaleString('ru-RU')} вакансиях
					</span>
					<span className="inline-flex items-center gap-1.5">
						<Clock3 className="size-3.5" aria-hidden="true" />
						{competency.market.salaryLift}
					</span>
				</div>
			) : (
				<p className="border-border text-muted-foreground mt-3 border-t pt-3 text-xs">
					Рыночных данных пока нет — навык не встречается в проверенном словаре.
				</p>
			)}
		</article>
	);
}
