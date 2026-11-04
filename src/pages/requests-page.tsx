import { BadgeCheck, FilePlus2, Info, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { selectRequests, useAppStore } from '@/app/store/app.store';
import { RequestStatusBadge, RequestStepper } from '@/entities/request/ui/request-status';
import { REQUEST_TYPES, STUDENTS } from '@/shared/api/mock';
import type { StudentRequest } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageHeader } from '@/shared/ui/page-header';
import { Sheet } from '@/shared/ui/sheet';
import { celebrate } from '@/shared/lib/confetti';
import { formatDateTime, humanInterval } from '@/shared/lib/dates';
import { toast } from '@/shared/ui/toast';

const STEP_LABELS = ['Тип заявки', 'Проверка данных', 'Отправка'] as const;

/** Карточка заявки: трекер, ответственный, срок и демо-продвижение статуса. */
function RequestCard({ request }: { request: StudentRequest }) {
	const advanceRequest = useAppStore((state) => state.advanceRequest);
	const latest = request.events[request.events.length - 1];
	const canAdvance = request.status !== 'ready' && request.status !== 'rejected';

	const handleAdvance = () => {
		advanceRequest(request.id);
		if (request.status === 'in-progress') {
			void celebrate();
			toast({
				title: 'Заявка готова',
				description: `${request.type} · ${request.id}. Электронная версия доступна в кабинете.`,
				variant: 'success',
			});
		} else {
			toast({
				title: 'Статус обновлён',
				description: `${request.id}: заявка взята в работу.`,
				variant: 'info',
			});
		}
	};

	return (
		<Card className="min-w-0">
			<CardContent className="flex flex-col gap-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="min-w-0">
						<h3 className="text-[15px] leading-snug font-semibold">{request.type}</h3>
						<p className="text-muted-foreground mt-0.5 text-xs">
							{request.id} · создана {formatDateTime(request.createdAt)}
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{request.verified ? (
							<Badge variant="success" title="Документ подписан ЭЦП и проверен в реестре">
								<BadgeCheck className="size-3.5" aria-hidden="true" />
								проверено
							</Badge>
						) : null}
						<RequestStatusBadge status={request.status} />
					</div>
				</div>

				<RequestStepper status={request.status} />

				<dl className="rounded-control bg-surface-2/70 grid grid-cols-1 gap-2 p-3 text-xs sm:grid-cols-2">
					<div>
						<dt className="text-muted-foreground">Ответственный</dt>
						<dd className="mt-0.5 font-semibold">{request.responsible}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Ожидаемый срок</dt>
						<dd className="mt-0.5 font-semibold">
							{request.dueAt
								? `${formatDateTime(request.dueAt)} · ${humanInterval(new Date(request.dueAt))}`
								: 'уточняется'}
						</dd>
					</div>
				</dl>

				{latest ? (
					<p className="text-muted-foreground text-xs">
						<span className="text-foreground font-semibold">{formatDateTime(latest.at)}</span> —{' '}
						{latest.comment}
					</p>
				) : null}

				{request.comment ? (
					<p className="rounded-control border-border text-muted-foreground border px-3 py-2 text-xs">
						Комментарий: {request.comment}
					</p>
				) : null}

				<div className="flex flex-wrap items-center gap-2">
					{canAdvance ? (
						<Button variant="soft" size="sm" onClick={handleAdvance}>
							Продвинуть статус (демо)
						</Button>
					) : (
						<Badge variant="muted">Заявка закрыта</Badge>
					)}
					<span className="text-muted-foreground text-[11px]">
						Кнопка нужна для демонстрации: в реальной системе статус меняет сотрудник.
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Заявки и справки: трекинг вместо «отправил и жди».
 * Новая заявка — три шага в шите, с подтверждением перед отправкой.
 */
export function RequestsPage() {
	const studentId = useAppStore((state) => state.studentId);
	const requests = useAppStore(useShallow(selectRequests));
	const createRequest = useAppStore((state) => state.createRequest);

	const [open, setOpen] = useState(false);
	const [step, setStep] = useState(0);
	const [typeId, setTypeId] = useState(REQUEST_TYPES[0]?.id ?? '');
	const [comment, setComment] = useState('');

	if (!studentId) return null;

	const student = STUDENTS[studentId];
	const selected = REQUEST_TYPES.find((item) => item.id === typeId) ?? REQUEST_TYPES[0];

	const reset = () => {
		setStep(0);
		setTypeId(REQUEST_TYPES[0]?.id ?? '');
		setComment('');
	};

	const close = () => {
		setOpen(false);
		reset();
	};

	const submit = () => {
		if (!selected) return;
		const created = createRequest({
			type: selected.title,
			comment: comment.trim() || undefined,
		});
		setOpen(false);
		reset();
		void celebrate();
		toast({
			title: 'Заявка отправлена',
			description: `${created.id} · ${created.type}. Срок — ${selected.duration}.`,
			variant: 'success',
		});
	};

	return (
		<div className="flex flex-col gap-5">
			<PageHeader
				title="Заявки и справки"
				description="Статус, ответственный и срок — как трекинг доставки. Готовый документ подписан ЭЦП."
				actions={
					<Button size="sm" onClick={() => setOpen(true)}>
						<FilePlus2 className="size-4" aria-hidden="true" />
						Новая заявка
					</Button>
				}
			/>

			<Card className="bg-surface-2/60">
				<CardContent className="flex items-start gap-3">
					<ShieldCheck className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
					<p className="text-muted-foreground text-xs leading-relaxed">
						Каждая заявка проходит три состояния. Срок назначается сразу, а не «в обработке» — если
						срок нарушен, это видно. Бейдж «проверено» означает, что документ подписан ЭЦП и
						проверен в реестре.
					</p>
				</CardContent>
			</Card>

			{requests.length === 0 ? (
				<EmptyState
					mood="curious"
					title="Заявок пока нет"
					description="Справка об обучении занимает до одного рабочего дня. Заявка — три шага, без очереди."
					action={
						<Button size="sm" onClick={() => setOpen(true)}>
							Заказать справку
						</Button>
					}
				/>
			) : (
				<div className="grid gap-3 lg:grid-cols-2">
					{requests.map((request) => (
						<RequestCard key={request.id} request={request} />
					))}
				</div>
			)}

			<Card className="border-lilac/30 bg-lilac-soft/40">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="text-lilac size-4" aria-hidden="true" />
						Почему это безопасно
					</CardTitle>
				</CardHeader>
				<CardContent className="text-muted-foreground pt-2 text-xs leading-relaxed">
					Заявки привязаны к аккаунту: студент видит только свои обращения. Подстановка чужого
					идентификатора в адресную строку возвращает «нет доступа», а не чужие данные.
				</CardContent>
			</Card>

			<Sheet
				open={open}
				onClose={close}
				title="Новая заявка"
				description={`Шаг ${step + 1} из 3 · ${STEP_LABELS[step]}`}
				footer={
					<>
						<Button variant="ghost" onClick={step === 0 ? close : () => setStep(step - 1)}>
							{step === 0 ? 'Отмена' : 'Назад'}
						</Button>
						{step < 1 ? (
							<Button onClick={() => setStep(1)} disabled={!selected}>
								Далее
							</Button>
						) : (
							<Button variant="success" onClick={submit}>
								Отправить заявку
							</Button>
						)}
					</>
				}
			>
				{step === 0 ? (
					<div className="flex flex-col gap-2">
						{REQUEST_TYPES.map((type) => {
							const active = type.id === typeId;
							return (
								<button
									key={type.id}
									type="button"
									onClick={() => setTypeId(type.id)}
									aria-pressed={active}
									className={`rounded-card focus-visible:ring-ring/25 flex items-start gap-3 border p-3.5 text-left transition-colors focus-visible:ring-4 focus-visible:outline-none ${
										active
											? 'border-primary bg-primary-soft/60'
											: 'border-border hover:bg-surface-2'
									}`}
								>
									<span
										aria-hidden="true"
										className={`mt-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
											active ? 'border-primary' : 'border-border'
										}`}
									>
										{active ? <span className="bg-primary size-2 rounded-full" /> : null}
									</span>
									<span className="min-w-0">
										<span className="flex flex-wrap items-center gap-2">
											<span className="text-sm font-semibold">{type.title}</span>
											<Badge variant="muted">{type.duration}</Badge>
										</span>
										<span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
											{type.description}
										</span>
									</span>
								</button>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<dl className="rounded-card bg-surface-2/70 flex flex-col gap-2 p-4 text-sm">
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Студент</dt>
								<dd className="text-right font-semibold">{student.fullName}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Группа</dt>
								<dd className="font-semibold">{student.group}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Зачётная книжка</dt>
								<dd className="tabular font-semibold">{student.recordBook}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Тип заявки</dt>
								<dd className="text-right font-semibold">{selected?.title}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Срок</dt>
								<dd className="font-semibold">{selected?.duration}</dd>
							</div>
						</dl>

						<label className="flex flex-col gap-1.5">
							<span className="text-xs font-semibold">Комментарий (необязательно)</span>
							<textarea
								value={comment}
								onChange={(event) => setComment(event.target.value)}
								rows={3}
								maxLength={280}
								placeholder="Например: нужна для визы, с указанием курса и формы обучения"
								className="rounded-control border-border bg-surface placeholder:text-muted-foreground/70 focus-visible:ring-ring/25 w-full resize-none border px-3 py-2 text-sm focus-visible:ring-4 focus-visible:outline-none"
							/>
							<span className="text-muted-foreground self-end text-[11px]">
								{comment.length} / 280
							</span>
						</label>

						<p className="text-muted-foreground text-[11px] leading-relaxed">
							Отправляя заявку, вы подтверждаете данные. Отменить заявку можно в течение часа — об
							этом предупредит подтверждение.
						</p>
					</div>
				)}
			</Sheet>
		</div>
	);
}
