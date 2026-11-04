import { GraduationCap, Info } from 'lucide-react';
import { useState } from 'react';

import { useAppStore } from '@/app/store/app.store';
import { CompetencyCard } from '@/entities/competency/ui/competency-card';
import { useCompetencies, useDisciplines } from '@/shared/api/hooks';
import { COMPETENCY_SOURCE, DEADLINES } from '@/shared/api/mock';
import type { Discipline } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { PageHeader } from '@/shared/ui/page-header';
import { Progress, ProgressRing } from '@/shared/ui/progress';
import { SkeletonList } from '@/shared/ui/skeleton';
import { Tabs, type TabOption } from '@/shared/ui/tabs';
import { deadlineLabel } from '@/shared/lib/dates';
import { useNow } from '@/shared/lib/use-now';

type View = 'progress' | 'skills';

const VIEW_OPTIONS: TabOption<View>[] = [
	{ value: 'progress', label: 'Дисциплины' },
	{ value: 'skills', label: 'Карта компетенций' },
];

function gradeLabel(discipline: Discipline): string {
	if (discipline.control === 'Курсовая' && discipline.grade === null) return 'в работе';
	if (discipline.grade === null) return 'не выставлена';
	return String(discipline.grade);
}

function gradeVariant(discipline: Discipline): 'success' | 'primary' | 'warning' | 'muted' {
	if (discipline.grade === null) return 'muted';
	if (discipline.grade >= 5) return 'success';
	if (discipline.grade === 4) return 'primary';
	return 'warning';
}

/**
 * Успеваемость: картина вместо таблицы.
 * Прогресс по дисциплинам + карта компетенций с указанием источника данных.
 */
export function GradesPage() {
	const studentId = useAppStore((state) => state.studentId);
	const [view, setView] = useState<View>('progress');
	const now = useNow(120_000);

	const disciplinesQuery = useDisciplines(studentId ?? 'student-1');
	const competenciesQuery = useCompetencies(studentId ?? 'student-1');

	if (!studentId) return null;

	const disciplines = disciplinesQuery.data ?? [];
	const competencies = competenciesQuery.data ?? [];

	const graded = disciplines.filter((item) => item.grade !== null);
	const average =
		graded.length > 0
			? graded.reduce((sum, item) => sum + (item.grade ?? 0), 0) / graded.length
			: 0;
	const totalCredits = disciplines.reduce((sum, item) => sum + item.credits, 0);
	const completed = disciplines.filter((item) => item.grade !== null).length;
	const weak = competencies
		.filter((item) => item.status !== 'verified')
		.sort((a, b) => a.level - b.level)
		.slice(0, 3);
	const deadlines = DEADLINES.filter((item) => item.studentId === studentId);

	const isLoading = disciplinesQuery.isLoading || competenciesQuery.isLoading;
	const isError = disciplinesQuery.isError || competenciesQuery.isError;

	return (
		<div className="flex flex-col gap-5">
			<PageHeader
				title="Успеваемость"
				description="Оценки, прогресс по дисциплинам и карта компетенций. Связки «дисциплина → навык» проверены вручную."
				actions={
					<Badge variant="success">
						<GraduationCap className="size-3.5" aria-hidden="true" />
						{completed} из {disciplines.length} закрыто
					</Badge>
				}
			/>

			{isError ? (
				<ErrorState
					onRetry={() => {
						void disciplinesQuery.refetch();
						void competenciesQuery.refetch();
					}}
				/>
			) : null}

			<div className="grid gap-4 sm:grid-cols-[auto_1fr]">
				<Card className="flex items-center justify-center p-5">
					<ProgressRing
						value={(average / 5) * 100}
						tone="primary"
						label={`Средний балл: ${average.toFixed(2)} из 5`}
					>
						<span className="tabular text-2xl leading-none font-bold">{average.toFixed(2)}</span>
						<span className="text-muted-foreground mt-1 text-[11px]">средний балл</span>
					</ProgressRing>
				</Card>

				<Card className="min-w-0">
					<CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
						<div>
							<p className="text-muted-foreground text-xs">Кредитов в семестре</p>
							<p className="tabular mt-1 text-xl font-bold">{totalCredits}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Дисциплин с оценкой</p>
							<p className="tabular mt-1 text-xl font-bold">
								{graded.length} / {disciplines.length}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Ближайший дедлайн</p>
							<p className="mt-1 text-sm font-semibold">
								{deadlines[0]
									? `${deadlines[0].title} — ${deadlineLabel(deadlines[0].dueAt, now)}`
									: 'нет'}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs
				options={VIEW_OPTIONS}
				value={view}
				onChange={setView}
				ariaLabel="Раздел успеваемости"
				stretch
				className="sm:w-auto sm:self-start"
			/>

			{isLoading ? <SkeletonList rows={3} /> : null}

			{!isLoading && !isError && view === 'progress' ? (
				<section className="flex flex-col gap-3" aria-label="Дисциплины">
					<h2 className="text-lg font-bold">Дисциплины</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{disciplines.map((discipline) => (
							<Card key={discipline.id}>
								<CardContent className="flex flex-col gap-3">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<h3 className="text-[15px] leading-snug font-semibold">{discipline.name}</h3>
											<p className="text-muted-foreground mt-0.5 text-xs">
												{discipline.teacher} · {discipline.control}
											</p>
										</div>
										<Badge variant={gradeVariant(discipline)}>{gradeLabel(discipline)}</Badge>
									</div>

									<div className="flex items-center gap-3">
										<Progress
											value={discipline.progress}
											tone={discipline.progress >= 80 ? 'success' : 'primary'}
											label={`Прогресс: ${discipline.name}`}
											className="flex-1"
										/>
										<span className="tabular w-10 text-right text-xs font-semibold">
											{discipline.progress} %
										</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			) : null}

			{!isLoading && !isError && view === 'skills' ? (
				<section className="flex flex-col gap-3" aria-label="Карта компетенций">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-lg font-bold">Карта компетенций</h2>
						<Badge variant="muted">
							<Info className="size-3.5" aria-hidden="true" />
							{COMPETENCY_SOURCE.updatedAt}
						</Badge>
					</div>

					{weak.length > 0 ? (
						<Card className="border-warning/30 bg-warning-soft/50">
							<CardHeader>
								<CardTitle>Что подтянуть в первую очередь</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-2 pt-2">
								{weak.map((item) => (
									<Badge key={item.id} variant="warning">
										{item.name} · {item.level} %
									</Badge>
								))}
							</CardContent>
						</Card>
					) : null}

					{competencies.length === 0 ? (
						<EmptyState
							title="Компетенций пока нет"
							description="Как только появятся подтверждённые связки «дисциплина → навык», они появятся здесь."
						/>
					) : (
						<div className="grid gap-3 md:grid-cols-2">
							{competencies.map((competency) => (
								<CompetencyCard key={competency.id} competency={competency} />
							))}
						</div>
					)}

					<Card className="bg-surface-2/60">
						<CardContent className="flex items-start gap-3">
							<Info className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
							<p className="text-muted-foreground text-xs leading-relaxed">
								<span className="text-foreground font-semibold">{COMPETENCY_SOURCE.label}.</span>{' '}
								{COMPETENCY_SOURCE.note} Если связки нет в словаре — мы честно пишем «данных пока
								нет», а не показываем «магическую рекомендацию».
							</p>
						</CardContent>
					</Card>
				</section>
			) : null}
		</div>
	);
}
