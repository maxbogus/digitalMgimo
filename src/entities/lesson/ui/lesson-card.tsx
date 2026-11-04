import { MapPin, TriangleAlert, UserRound } from 'lucide-react';

import type { Lesson, LessonKind } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/cn';

const KIND_LABEL: Record<LessonKind, string> = {
	lecture: 'Лекция',
	seminar: 'Семинар',
	lab: 'Практикум',
	exam: 'Экзамен',
};

const KIND_VARIANT: Record<LessonKind, 'primary' | 'lilac' | 'success' | 'danger'> = {
	lecture: 'primary',
	seminar: 'lilac',
	lab: 'success',
	exam: 'danger',
};

interface LessonCardProps {
	lesson: Lesson;
	className?: string;
}

/**
 * Карточка пары. Изменения показываются инлайн: старое время зачёркнуто,
 * рядом бейдж «изменено» и причина — требование из отзывов студентов.
 */
export function LessonCard({ lesson, className }: LessonCardProps) {
	const changed = Boolean(lesson.change);

	return (
		<article
			className={cn(
				'rounded-card bg-surface shadow-card border p-4 transition-colors',
				changed ? 'border-warning/45' : 'border-border',
				className,
			)}
		>
			<div className="flex gap-3.5">
				<div className="w-14 shrink-0 pt-0.5">
					<p className="tabular text-[15px] leading-tight font-bold">{lesson.start}</p>
					<p className="tabular text-muted-foreground text-[11px]">{lesson.end}</p>
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="text-[15px] leading-snug font-semibold">{lesson.subject}</h3>
						<Badge variant={KIND_VARIANT[lesson.kind]}>{KIND_LABEL[lesson.kind]}</Badge>
						{changed ? (
							<Badge variant="warning">
								<TriangleAlert className="size-3.5" />
								изменено
							</Badge>
						) : null}
					</div>

					<p className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
						<span className="inline-flex items-center gap-1">
							<MapPin className="size-3.5" aria-hidden="true" />
							ауд. {lesson.room}
						</span>
						<span className="inline-flex items-center gap-1">
							<UserRound className="size-3.5" aria-hidden="true" />
							{lesson.teacher}
						</span>
					</p>

					{lesson.change ? (
						<p className="bg-warning-soft text-warning mt-2 rounded-xl px-3 py-2 text-xs leading-snug">
							<s className="opacity-70">
								{lesson.change.previousStart}–{lesson.change.previousEnd}
							</s>{' '}
							→ {lesson.start}–{lesson.end}. Причина: {lesson.change.reason}.
						</p>
					) : null}

					{lesson.note ? (
						<p className="text-muted-foreground mt-2 text-xs leading-snug">{lesson.note}</p>
					) : null}
				</div>
			</div>
		</article>
	);
}
