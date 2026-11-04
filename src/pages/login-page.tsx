import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Landmark, ShieldCheck, Sparkles } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAppStore } from '@/app/store/app.store';
import { STUDENTS, TEST_ACCOUNTS } from '@/shared/api/mock';
import type { StudentId } from '@/shared/api/types';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Mascot } from '@/shared/ui/mascot';
import { toast } from '@/shared/ui/toast';

const BENEFITS = [
	'Расписание, оценки, заявки и уведомления — в одном экране',
	'Статус заявки виден как трекинг доставки: срок и ответственный',
	'Навыки связаны с дисциплинами и вакансиями — с указанием источника',
];

/**
 * Экран входа: два тестовых аккаунта и заглушка Госуслуг.
 * Пароли не запрашиваются осознанно — это демо с вымышленными данными.
 */
export function LoginPage() {
	const studentId = useAppStore((state) => state.studentId);
	const signIn = useAppStore((state) => state.signIn);
	const navigate = useNavigate();
	const reduce = useReducedMotion();

	if (studentId) {
		return <Navigate to="/" replace />;
	}

	const handleSignIn = (id: StudentId) => {
		const student = STUDENTS[id];
		signIn(id);
		toast({
			title: `Здравствуйте, ${student.shortName}!`,
			description: 'Данные демонстрационные. Чужие заявки недоступны даже по прямой ссылке.',
			variant: 'success',
		});
		navigate('/', { replace: true });
	};

	return (
		<div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
			<section className="mesh-soft relative flex min-w-0 flex-col justify-between overflow-hidden px-5 py-8 sm:px-10 lg:py-12">
				<div className="flex items-center gap-3">
					<span className="bg-brand shadow-card grid size-11 place-items-center rounded-2xl text-white">
						<Landmark className="size-5" aria-hidden="true" />
					</span>
					<div className="leading-tight">
						<p className="text-[15px] font-bold">Цифровой деканат</p>
						<p className="text-muted-foreground text-xs">МГИМО · демо-прототип</p>
						<p className="text-muted-foreground text-[11px]">не официальный сервис</p>
					</div>
				</div>

				<motion.div
					className="my-8 max-w-xl"
					initial={reduce ? false : { opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
				>
					<Badge variant="primary" className="mb-4">
						<Sparkles className="size-3.5" aria-hidden="true" />
						Деканат, в который хочется заходить
					</Badge>
					<h1 className="text-[30px] leading-[1.1] font-bold tracking-tight sm:text-[42px]">
						Всё про учёбу — <span className="text-primary">в одном экране</span>, без очередей и «в
						обработке»
					</h1>
					<p className="text-muted-foreground mt-3 max-w-lg text-[15px]">
						Расписание с изменениями, прогресс по компетенциям, заявки со сроком и ответственным.
						Данные вымышленные — это прототип, а не личный кабинет.
					</p>

					<ul className="mt-6 flex flex-col gap-2.5">
						{BENEFITS.map((benefit) => (
							<li key={benefit} className="flex items-start gap-2.5 text-sm">
								<ShieldCheck className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
								<span>{benefit}</span>
							</li>
						))}
					</ul>
				</motion.div>

				<div className="flex items-end gap-3">
					<Mascot mood="wink" size={112} />
					<p className="text-muted-foreground mb-2 max-w-[15rem] text-xs leading-snug">
						Я Дек, совёнок деканата. Подскажу, если что-то не загрузилось, и порадуюсь, когда
						справка будет готова.
					</p>
				</div>
			</section>

			<section className="flex items-center justify-center px-4 py-10 sm:px-8">
				<motion.div
					className="w-full max-w-md"
					initial={reduce ? false : { opacity: 0, y: 22 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
				>
					<Card className="p-5 sm:p-6">
						<h2 className="text-xl font-bold">Вход в кабинет</h2>
						<p className="text-muted-foreground mt-1 text-sm">
							Выберите тестовый аккаунт — пароли в прототипе не используются.
						</p>

						<div className="mt-4 flex flex-col gap-2.5">
							{TEST_ACCOUNTS.map((account) => {
								const student = STUDENTS[account.id];
								return (
									<button
										key={account.id}
										type="button"
										onClick={() => handleSignIn(account.id)}
										className="group rounded-card border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/40 focus-visible:ring-ring/25 flex min-h-11 w-full items-center gap-3 border p-3.5 text-left transition-colors focus-visible:ring-4 focus-visible:outline-none"
									>
										<Avatar name={student.fullName} gradient={student.avatarGradient} size="md" />
										<span className="min-w-0 flex-1">
											<span className="block text-sm font-semibold">{account.label}</span>
											<span className="text-muted-foreground block truncate text-xs">
												{account.hint}
											</span>
										</span>
										<ArrowRight
											className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
											aria-hidden="true"
										/>
									</button>
								);
							})}
						</div>

						<div className="my-4 flex items-center gap-3">
							<span className="bg-border h-px flex-1" />
							<span className="text-muted-foreground text-[11px]">или</span>
							<span className="bg-border h-px flex-1" />
						</div>

						<Button
							variant="secondary"
							block
							onClick={() =>
								toast({
									title: 'Вход через Госуслуги — заглушка',
									description:
										'В прототипе показана точка интеграции. Реальная идентификация не подключена.',
									variant: 'info',
								})
							}
						>
							<img
								src={`${import.meta.env.BASE_URL}favicon.svg`}
								alt=""
								aria-hidden="true"
								className="size-5 rounded"
							/>
							Войти через Госуслуги
							<Badge variant="outline">заглушка</Badge>
						</Button>

						<p className="text-muted-foreground mt-4 text-[11px] leading-relaxed">
							Данные вымышлены. Разделение доступа проверяется на уровне архитектуры: студент видит
							только свои заявки, даже если подставить чужой адрес.
						</p>
					</Card>
				</motion.div>
			</section>
		</div>
	);
}
