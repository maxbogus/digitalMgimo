import { BellOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import { selectUnreadCount, selectVisibleNotifications, useAppStore } from '@/app/store/app.store';
import { PriorityBadge } from '@/entities/notification/ui/priority-badge';
import type { NotificationPriority } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageHeader } from '@/shared/ui/page-header';
import { Switch } from '@/shared/ui/switch';
import { Tabs, type TabOption } from '@/shared/ui/tabs';
import { cn } from '@/shared/lib/cn';
import { humanInterval } from '@/shared/lib/dates';

type Filter = 'all' | NotificationPriority;

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
	critical: 0,
	important: 1,
	info: 2,
};

/** Уведомления: жёсткая приоритизация на три категории и управление каналами. */
export function NotificationsPage() {
	const notifications = useAppStore(useShallow(selectVisibleNotifications));
	const unread = useAppStore(selectUnreadCount);
	const channels = useAppStore((state) => state.channels);
	const setChannel = useAppStore((state) => state.setChannel);
	const markRead = useAppStore((state) => state.markNotificationRead);
	const markAllRead = useAppStore((state) => state.markAllRead);

	const [filter, setFilter] = useState<Filter>('all');

	const filtered =
		filter === 'all' ? notifications : notifications.filter((item) => item.priority === filter);

	const counts = {
		all: notifications.length,
		critical: notifications.filter((item) => item.priority === 'critical').length,
		important: notifications.filter((item) => item.priority === 'important').length,
		info: notifications.filter((item) => item.priority === 'info').length,
	} satisfies Record<Filter, number>;

	const options: TabOption<Filter>[] = [
		{ value: 'all', label: 'Все', count: counts.all },
		{ value: 'critical', label: 'Критично', count: counts.critical },
		{ value: 'important', label: 'Важно', count: counts.important },
		{ value: 'info', label: 'Инфо', count: counts.info },
	];

	const sorted = [...filtered].sort(
		(a, b) =>
			Number(a.read) - Number(b.read) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
	);

	return (
		<div className="flex flex-col gap-5">
			<PageHeader
				title="Уведомления"
				description="Три категории: критично, важно, информационно. Критичные отключить нельзя — это часть безопасности."
				actions={
					<Button variant="secondary" size="sm" onClick={markAllRead} disabled={unread === 0}>
						Прочитать все
					</Button>
				}
			/>

			<Tabs
				options={options}
				value={filter}
				onChange={setFilter}
				ariaLabel="Фильтр уведомлений"
				stretch
				className="sm:w-auto sm:self-start"
			/>

			<Card>
				<CardHeader>
					<CardTitle>Каналы</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-1 pt-2">
					<Switch
						checked={channels.critical}
						onChange={(value) => setChannel('critical', value)}
						label="Критичные"
						description="Изменения в расписании и дедлайны. Отключить нельзя."
						disabled
					/>
					<Switch
						checked={channels.important}
						onChange={(value) => setChannel('important', value)}
						label="Важные"
						description="Статусы заявок, зачёты, напоминания от деканата."
					/>
					<Switch
						checked={channels.info}
						onChange={(value) => setChannel('info', value)}
						label="Информационные"
						description="Элективы, новости, обновления словаря формулировок."
					/>
				</CardContent>
			</Card>

			{sorted.length === 0 ? (
				<EmptyState
					mood="party"
					title="Здесь пусто"
					description="Все уведомления этой категории прочитаны или отключены. Критичные всегда остаются включёнными."
					action={
						<Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
							Показать все
						</Button>
					}
				/>
			) : (
				<div className="flex flex-col gap-3">
					{sorted.map((item) => (
						<article
							key={item.id}
							className={cn(
								'rounded-card shadow-card min-w-0 border p-4 transition-colors',
								item.read ? 'border-border bg-surface' : 'border-primary/30 bg-primary-soft/20',
							)}
						>
							<div className="flex items-start gap-2.5">
								<span
									aria-hidden="true"
									className={cn(
										'mt-2 size-2 shrink-0 rounded-full',
										item.read ? 'bg-border' : 'bg-primary',
									)}
								/>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<PriorityBadge priority={item.priority} />
										{item.read ? <Badge variant="outline">прочитано</Badge> : null}
									</div>
									<h2 className="mt-1.5 text-sm leading-snug font-semibold">{item.title}</h2>
									<p className="text-muted-foreground mt-1 text-sm">{item.body}</p>
									<p className="text-muted-foreground mt-2 text-[11px]">
										{humanInterval(new Date(item.createdAt))}
									</p>

									<div className="mt-3 flex flex-wrap items-center gap-2">
										{item.action ? (
											<Link
												to={item.action.to}
												className="rounded-control bg-primary-soft text-primary hover:bg-primary-soft/70 inline-flex min-h-9 items-center px-3 text-xs font-semibold transition-colors"
											>
												{item.action.label}
											</Link>
										) : null}
										{!item.read ? (
											<Button variant="ghost" size="sm" onClick={() => markRead(item.id)}>
												Отметить прочитанным
											</Button>
										) : null}
									</div>
								</div>
							</div>
						</article>
					))}
				</div>
			)}

			<Card className="bg-surface-2/60">
				<CardContent className="flex items-start gap-3">
					<BellOff className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
					<p className="text-muted-foreground text-xs leading-relaxed">
						Push-уведомления не отправляются «для галочки»: по умолчанию включены только те
						категории, которые вы выбрали. Критичные остаются всегда — иначе можно пропустить
						перенос пары или дедлайн.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
