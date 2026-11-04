import { MapPin, TriangleAlert, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import {
	selectRequests,
	selectUnreadCount,
	selectVisibleNotifications,
	useAppStore,
} from '@/app/store/app.store';
import { LessonCard } from '@/entities/lesson/ui/lesson-card';
import { PriorityBadge } from '@/entities/notification/ui/priority-badge';
import { RequestStatusBadge } from '@/entities/request/ui/request-status';
import { useLessons, useStudent } from '@/shared/api/hooks';
import { DEADLINES, STUDENTS, lessonsForDate } from '@/shared/api/mock';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { PageHeader } from '@/shared/ui/page-header';
import { SkeletonList } from '@/shared/ui/skeleton';
import {
	deadlineLabel,
	formatDayLong,
	humanInterval,
	pluralize,
	timeToMinutes,
} from '@/shared/lib/dates';
import { useNow } from '@/shared/lib/use-now';

/** Приветствие по времени суток. */
function greeting(date: Date): string {
	const hour = date.getHours();
	if (hour < 5) return 'Доброй ночи';
	if (hour < 12) return 'Доброе утро';
	if (hour < 18) return 'Добрый день';
	return 'Добрый вечер';
}

/** Дата «сегодня в ЧЧ:ММ» — для обратного отсчёта. */
function dateAtTime(time: string, base: Date): Date {
	const [hours = '0', minutes = '0'] = time.split(':');
	const result = new Date(base);
	result.setHours(Number(hours), Number(minutes), 0, 0);
	return result;
}

/**
 * Главный экран: один ответ на вопрос «что сейчас?».
 * Следующая пара + лента дня + то, что требует внимания.
 */
export function TodayPage() {
	const navigate = useNavigate();
	const studentId = useAppStore((state) => state.studentId);
	const requests = useAppStore(useShallow(selectRequests));
	const notifications = useAppStore(useShallow(selectVisibleNotifications));
	const unread = useAppStore(selectUnreadCount);
	const now = useNow(30_000);
	const lessonsQuery = useLessons(studentId ?? 'student-1');
	const studentQuery = useStudent(studentId ?? 'student-1');

	if (!studentId) return null;

	const student = STUDENTS[studentId];

	const todayLessons = lessonsForDate(studentId, now);
	const deadlines = DEADLINES.filter((item) => item.studentId === studentId).sort((a, b) =>
		a.dueAt.localeCompare(b.dueAt),
	);
	const activeRequests = requests.filter((request) => request.status !== 'ready');
	const critical = notifications.filter((item) => item.priority === 'critical');

	const minutesNow = now.getHours() * 60 + now.getMinutes();
	const current = todayLessons.find(
		(lesson) => timeToMinutes(lesson.start) <= minutesNow && minutesNow < timeToMinutes(lesson.end),
	);
	const upcoming = todayLessons.find((lesson) => timeToMinutes(lesson.start) > minutesNow);
	const focus = current ?? upcoming;

	const isLoading = lessonsQuery.isLoading || studentQuery.isLoading;
	const isError = lessonsQuery.isError || studentQuery.isError;

	return (
		<div className="flex flex-col gap-5">
			<PageHeader
				title={`${greeting(now)}, ${student.shortName}`}
				description={`${formatDayLong(now)} · ${student.group} · ${student.program}`}
				actions={
					<>
						<Button variant="secondary" size="sm" onClick={() => navigate('/schedule')}>
							Всё расписание
						</Button>
						<Button size="sm" onClick={() => navigate('/requests')}>
							Заказать справку
						</Button>
					</>
				}
			/>

			{isError ? (
				<ErrorState
					onRetry={() => {
						void lessonsQuery.refetch();
						void studentQuery.refetch();
					}}
				/>
			) : null}

			{focus ? (
				<Card className="mesh-soft border-primary/20 overflow-hidden">
					<div className="flex items-start justify-between gap-4 p-5">
						<div className="min-w-0">
							<Badge variant={current ? 'success' : 'primary'}>
								{current ? 'Сейчас идёт' : 'Следующая пара'}
							</Badge>
							<h2 className="mt-2 text-xl leading-snug font-bold sm:text-2xl">{focus.subject}</h2>
							<p className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
								<span className="inline-flex items-center gap-1.5">
									<MapPin className="size-4" aria-hidden="true" />
									ауд. {focus.room}
								</span>
								<span className="inline-flex items-center gap-1.5">
									<UserRound className="size-4" aria-hidden="true" />
									{focus.teacher}
								</span>
							</p>
							{focus.change ? (
								<p className="bg-warning-soft text-warning mt-3 inline-flex items-start gap-1.5 rounded-xl px-3 py-2 text-xs">
									<TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
									<span>
										Время изменено: <s>{focus.change.previousStart}</s> → {focus.start}. Причина:{' '}
										{focus.change.reason}.
									</span>
								</p>
							) : null}
						</div>
						<div className="shrink-0 text-right">
							<p className="tabular text-2xl leading-none font-bold sm:text-3xl">{focus.start}</p>
							<p className="text-muted-foreground mt-1 text-[11px]">
								{current ? `до ${focus.end}` : humanInterval(dateAtTime(focus.start, now), now)}
							</p>
						</div>
					</div>
				</Card>
			) : null}

			<div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
				<section className="flex min-w-0 flex-col gap-3" aria-labelledby="today-feed">
					<div className="flex items-center justify-between">
						<h2 id="today-feed" className="text-lg font-bold">
							Лента дня
						</h2>
						<span className="text-muted-foreground text-xs">
							{todayLessons.length} {pluralize(todayLessons.length, ['пара', 'пары', 'пар'])} ·{' '}
							{unread} новых
						</span>
					</div>

					{isLoading ? <SkeletonList rows={3} /> : null}

					{!isLoading && todayLessons.length === 0 ? (
						<EmptyState
							mood="sleepy"
							title="Сегодня пар нет"
							description="Свободный день — хорошее время закрыть дедлайн или выбрать электив. Вот что на неделе."
							action={
								<Button variant="secondary" size="sm" onClick={() => navigate('/grades')}>
									Смотреть дедлайны и навыки
								</Button>
							}
						/>
					) : null}

					{!isLoading && todayLessons.length > 0 ? (
						<div className="flex flex-col gap-3">
							{todayLessons.map((lesson) => (
								<LessonCard key={lesson.id} lesson={lesson} />
							))}
						</div>
					) : null}

					<Card>
						<CardHeader>
							<CardTitle>Требует внимания</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-3 pt-3">
							{critical.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									Критичных уведомлений нет — можно спокойно учиться.
								</p>
							) : (
								critical.map((item) => (
									<Link
										key={item.id}
										to={item.action?.to ?? '/notifications'}
										className="group rounded-control border-border hover:border-primary/40 hover:bg-primary-soft/30 flex items-start gap-3 border p-3 transition-colors"
									>
										<span className="min-w-0 flex-1">
											<span className="mb-1 flex items-center gap-2">
												<PriorityBadge priority={item.priority} />
											</span>
											<span className="block text-sm font-semibold">{item.title}</span>
											<span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
												{item.body}
											</span>
										</span>
									</Link>
								))
							)}
						</CardContent>
					</Card>
				</section>

				<aside className="flex min-w-0 flex-col gap-3">
					<Card>
						<CardHeader>
							<CardTitle>Дедлайны недели</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-2.5 pt-3">
							{deadlines.length === 0 ? (
								<p className="text-muted-foreground text-sm">На неделе дедлайнов нет.</p>
							) : (
								deadlines.map((deadline) => {
									const urgent = deadlineLabel(deadline.dueAt, now) === 'сегодня';
									return (
										<div key={deadline.id} className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="text-sm font-semibold">{deadline.title}</p>
												<p className="text-muted-foreground text-xs">{deadline.subject}</p>
											</div>
											<Badge variant={urgent ? 'danger' : 'muted'}>
												{deadlineLabel(deadline.dueAt, now)}
											</Badge>
										</div>
									);
								})
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Заявки в работе</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-2.5 pt-3">
							{activeRequests.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									Активных заявок нет. Новая заявка занимает три шага.
								</p>
							) : (
								activeRequests.slice(0, 3).map((request) => (
									<Link
										key={request.id}
										to="/requests"
										className="rounded-control hover:bg-surface-2 flex items-center justify-between gap-3 px-1 py-1.5 transition-colors"
									>
										<span className="min-w-0">
											<span className="block truncate text-sm font-semibold">{request.type}</span>
											<span className="text-muted-foreground block text-[11px]">
												{request.id} · {request.responsible}
											</span>
										</span>
										<RequestStatusBadge status={request.status} />
									</Link>
								))
							)}
							<Button
								variant="soft"
								size="sm"
								className="mt-1"
								onClick={() => navigate('/requests')}
							>
								Открыть заявки
							</Button>
						</CardContent>
					</Card>

					<Card className="border-lilac/30 bg-lilac-soft/50">
						<CardContent className="flex items-start gap-3">
							<span className="bg-surface text-lilac shadow-card grid size-10 shrink-0 place-items-center rounded-2xl">
								<TriangleAlert className="size-5" aria-hidden="true" />
							</span>
							<div>
								<p className="text-sm font-semibold">Кто что видит</p>
								<p className="text-muted-foreground mt-0.5 text-xs leading-snug">
									В профиле есть карта доступов: какие данные видит вуз, а какие не уходят никуда
									без согласия.
								</p>
								<Button
									variant="ghost"
									size="sm"
									className="text-lilac hover:text-lilac mt-1 -ml-2"
									onClick={() => navigate('/profile')}
								>
									Посмотреть доступы
								</Button>
							</div>
						</CardContent>
					</Card>
				</aside>
			</div>
		</div>
	);
}
