import { Check, Minus, ShieldQuestion } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { cn } from '@/shared/lib/cn';

type Access = 'full' | 'partial' | 'none';

interface AccessRow {
	key: string;
	label: string;
	student: Access;
	teacher: Access;
	admin: Access;
	/** Что уходит в государственный контур (агрегаты, не персональные данные). */
	state: Access;
}

const ROWS: AccessRow[] = [
	{
		key: 'profile',
		label: 'Профиль и контакты',
		student: 'full',
		teacher: 'partial',
		admin: 'full',
		state: 'partial',
	},
	{
		key: 'schedule',
		label: 'Расписание',
		student: 'full',
		teacher: 'full',
		admin: 'full',
		state: 'none',
	},
	{
		key: 'grades',
		label: 'Оценки и зачёты',
		student: 'full',
		teacher: 'partial',
		admin: 'full',
		state: 'partial',
	},
	{
		key: 'requests',
		label: 'Заявки и справки',
		student: 'full',
		teacher: 'none',
		admin: 'full',
		state: 'none',
	},
	{
		key: 'portfolio',
		label: 'Портфолио и отзывы',
		student: 'full',
		teacher: 'partial',
		admin: 'partial',
		state: 'none',
	},
	{
		key: 'trajectory',
		label: 'Личная траектория',
		student: 'full',
		teacher: 'none',
		admin: 'none',
		state: 'none',
	},
];

const CELL: Record<Access, { icon: typeof Check; text: string; className: string }> = {
	full: { icon: Check, text: 'видит полностью', className: 'text-success' },
	partial: { icon: Minus, text: 'видит частично', className: 'text-warning' },
	none: { icon: Minus, text: 'не видит', className: 'text-muted-foreground/70' },
};

function Cell({ access }: { access: Access }) {
	const meta = CELL[access];
	const Icon = meta.icon;
	return (
		<span className="inline-flex items-center justify-center gap-1">
			<Icon className={cn('size-4', meta.className)} aria-hidden="true" />
			<span className="sr-only">{meta.text}</span>
		</span>
	);
}

/**
 * Экран-декларация «Кто что видит». Показывает разницу между верификацией
 * (государство подтверждает подлинность) и контролем (чтение личной траектории).
 */
export function AccessMap() {
	const [shareAggregates, setShareAggregates] = useState(false);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShieldQuestion className="text-primary size-4" aria-hidden="true" />
					Кто что видит
				</CardTitle>
				<CardDescription>
					Верификация — это подтверждение подлинности. Контроль — чтение личной траектории. Мы
					разделяем эти вещи.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 pt-3">
				<div
					className="relative min-w-0 overflow-x-auto"
					role="region"
					aria-label="Матрица доступа к данным"
					tabIndex={0}
				>
					<table className="w-full min-w-[34rem] border-separate border-spacing-0 text-sm">
						<caption className="sr-only">Матрица доступа к данным по ролям</caption>
						<thead>
							<tr className="text-muted-foreground text-left text-[11px]">
								<th scope="col" className="pr-3 pb-2 font-semibold">
									Данные
								</th>
								<th scope="col" className="px-2 pb-2 text-center font-semibold">
									Студент
								</th>
								<th scope="col" className="px-2 pb-2 text-center font-semibold">
									Преподаватель
								</th>
								<th scope="col" className="px-2 pb-2 text-center font-semibold">
									Деканат
								</th>
								<th scope="col" className="px-2 pb-2 text-center font-semibold">
									Гос. контур
								</th>
							</tr>
						</thead>
						<tbody>
							{ROWS.map((row) => (
								<tr key={row.key} className="border-border border-t">
									<th
										scope="row"
										className="border-border border-t py-2 pr-3 text-left font-medium"
									>
										{row.label}
									</th>
									<td className="border-border border-t px-2 py-2 text-center">
										<Cell access={row.student} />
									</td>
									<td className="border-border border-t px-2 py-2 text-center">
										<Cell access={row.teacher} />
									</td>
									<td className="border-border border-t px-2 py-2 text-center">
										<Cell access={row.admin} />
									</td>
									<td className="border-border border-t px-2 py-2 text-center">
										<Cell access={shareAggregates ? row.state : 'none'} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="rounded-control bg-surface-2/70 p-3">
					<Switch
						checked={shareAggregates}
						onChange={setShareAggregates}
						label="Передавать агрегированные сигналы в государственный контур"
						description="Только обезличенные агрегаты: разрывы программ и рынка. Личная траектория не передаётся."
					/>
				</div>

				<p className="text-muted-foreground text-xs leading-relaxed">
					Студент видит только свои данные: чужая заявка не открывается даже по прямой ссылке.
					Преподаватель видит только свои дисциплины. Доступ администратора к личной траектории
					требует основания и фиксируется в журнале.
				</p>
			</CardContent>
		</Card>
	);
}
