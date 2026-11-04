import { addDays } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

import { useAppStore } from '@/app/store/app.store';
import { LessonCard } from '@/entities/lesson/ui/lesson-card';
import { STUDENTS } from '@/shared/api/mock';
import { useLessons } from '@/shared/api/hooks';
import type { Lesson } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { PageHeader } from '@/shared/ui/page-header';
import { SkeletonList } from '@/shared/ui/skeleton';
import { Tabs, type TabOption } from '@/shared/ui/tabs';
import {
	formatDayShort,
	formatWeekdayShort,
	timeToMinutes,
	weekDays,
	weekdayNumber,
} from '@/shared/lib/dates';
import { useNow } from '@/shared/lib/use-now';

type View = 'today' | 'tomorrow' | 'week';

const VIEW_OPTIONS: TabOption<View>[] = [
	{ value: 'today', label: 'Сегодня' },
	{ value: 'tomorrow', label: 'Завтра' },
	{ value: 'week', label: 'Неделя' },
];

function sortLessons(lessons: Lesson[]): Lesson[] {
	return [...lessons].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
}

/**
 * Расписание: список (мобильный паттерн), неделя — по дням.
 * Изменения показываются инлайн, пустой день — с подсказкой действия.
 */
export function SchedulePage() {
	const studentId = useAppStore((state) => state.studentId);
	const [view, setView] = useState<View>('today');
	const now = useNow(60_000);
	const lessonsQuery = useLessons(studentId ?? 'student-1');

	if (!studentId) return null;

	const student = STUDENTS[studentId];
	const lessons = lessonsQuery.data ?? [];

	const todayLessons = sortLessons(
		lessons.filter((lesson) => lesson.weekday === weekdayNumber(now)),
	);
	const tomorrowLessons = sortLessons(
		lessons.filter((lesson) => lesson.weekday === weekdayNumber(addDays(now, 1))),
	);

	const days = weekDays(now);
	const currentWeekday = weekdayNumber(now);

	return (
		<div className="flex flex-col gap-5">
			<PageHeader
				title="Расписание"
				description={`${student.group} · ${student.faculty}. Изменения подсвечиваются сразу — с причиной, если она не конфиденциальна.`}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Tabs
					options={VIEW_OPTIONS}
					value={view}
					onChange={setView}
					ariaLabel="Период расписания"
					stretch
					className="sm:w-auto sm:flex-none"
				/>
				<Badge variant="muted" className="self-start sm:self-auto">
					<CalendarDays className="size-3.5" aria-hidden="true" />
					{formatDayShort(now)} · {formatWeekdayShort(now)}
				</Badge>
			</div>

			{lessonsQuery.isError ? <ErrorState onRetry={() => void lessonsQuery.refetch()} /> : null}

			{lessonsQuery.isLoading ? <SkeletonList rows={4} /> : null}

			{!lessonsQuery.isLoading && !lessonsQuery.isError ? (
				<>
					{view === 'today' ? <DaySection lessons={todayLessons} title="Сегодня" /> : null}

					{view === 'tomorrow' ? <DaySection lessons={tomorrowLessons} title="Завтра" /> : null}

					{view === 'week' ? (
						<div className="flex flex-col gap-6">
							{days.map((day) => {
								const weekday = weekdayNumber(day);
								const dayLessons = sortLessons(
									lessons.filter((lesson) => lesson.weekday === weekday),
								);
								const isToday = weekday === currentWeekday;

								return (
									<section key={day.toISOString()} aria-label={formatDayShort(day)}>
										<div className="mb-2 flex items-center gap-2">
											<h2 className="text-sm font-bold capitalize">
												{formatWeekdayShort(day)}, {formatDayShort(day)}
											</h2>
											{isToday ? <Badge variant="primary">сегодня</Badge> : null}
											<Badge variant="muted">{dayLessons.length}</Badge>
										</div>
										{dayLessons.length === 0 ? (
											<p className="rounded-card border-border text-muted-foreground border border-dashed px-4 py-3 text-xs">
												Пар нет
											</p>
										) : (
											<div className="flex flex-col gap-2.5">
												{dayLessons.map((lesson) => (
													<LessonCard key={lesson.id} lesson={lesson} />
												))}
											</div>
										)}
									</section>
								);
							})}
						</div>
					) : null}
				</>
			) : null}
		</div>
	);
}

interface DaySectionProps {
	lessons: Lesson[];
	title: string;
}

/** Список пар одного дня с пустым состоянием и подсказкой действия. */
function DaySection({ lessons, title }: DaySectionProps) {
	return (
		<section className="flex flex-col gap-3" aria-label={title}>
			<h2 className="text-lg font-bold">{title}</h2>
			{lessons.length === 0 ? (
				<EmptyState
					mood="sleepy"
					title="Пар нет"
					description="Свободный день. Загляните в дедлайны недели или выберите электив, который закрывает навык."
				/>
			) : (
				<div className="flex flex-col gap-3">
					{lessons.map((lesson) => (
						<LessonCard key={lesson.id} lesson={lesson} />
					))}
				</div>
			)}
		</section>
	);
}
