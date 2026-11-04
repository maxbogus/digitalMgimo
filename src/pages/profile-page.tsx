import { BadgeCheck, Landmark, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@/app/store/app.store';
import { STUDENTS } from '@/shared/api/mock';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { Switch } from '@/shared/ui/switch';
import { toast } from '@/shared/ui/toast';
import { AccessMap } from '@/widgets/access-map';

interface InfoRowProps {
	label: string;
	value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
	return (
		<div className="border-border flex items-baseline justify-between gap-3 border-b py-2 last:border-0">
			<dt className="text-muted-foreground text-xs">{label}</dt>
			<dd className="text-right text-sm font-semibold">{value}</dd>
		</div>
	);
}

/**
 * Профиль: данные студента, статус идентификации, карта доступов и настройки демо.
 */
export function ProfilePage() {
	const studentId = useAppStore((state) => state.studentId);
	const theme = useAppStore((state) => state.theme);
	const toggleTheme = useAppStore((state) => state.toggleTheme);
	const chaos = useAppStore((state) => state.chaos);
	const setChaos = useAppStore((state) => state.setChaos);
	const signOut = useAppStore((state) => state.signOut);
	const navigate = useNavigate();

	if (!studentId) return null;

	const student = STUDENTS[studentId];

	const handleSignOut = () => {
		signOut();
		toast({ title: 'Вы вышли из кабинета', variant: 'info' });
		navigate('/login', { replace: true });
	};

	return (
		<div className="flex flex-col gap-5">
			<PageHeader
				title="Профиль"
				description="Данные вымышлены. Здесь же — карта доступов: кто и что видит в системе."
				actions={
					<Button variant="secondary" size="sm" onClick={handleSignOut}>
						<LogOut className="size-4" aria-hidden="true" />
						Выйти
					</Button>
				}
			/>

			<div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
				<div className="flex min-w-0 flex-col gap-4">
					<Card>
						<CardContent className="flex flex-col gap-4">
							<div className="flex items-start gap-4">
								<Avatar name={student.fullName} gradient={student.avatarGradient} size="lg" />
								<div className="min-w-0">
									<h2 className="text-lg leading-tight font-bold">{student.fullName}</h2>
									<p className="text-muted-foreground mt-1 text-sm">{student.faculty}</p>
									<div className="mt-2 flex flex-wrap gap-2">
										<Badge variant="primary">
											{student.course} курс · {student.group}
										</Badge>
										{student.identityVerified ? (
											<Badge variant="success">
												<BadgeCheck className="size-3.5" aria-hidden="true" />
												данные подтверждены
											</Badge>
										) : null}
									</div>
								</div>
							</div>

							<dl className="flex flex-col">
								<InfoRow label="Направление" value={student.program} />
								<InfoRow label="Курс" value={`${student.course}`} />
								<InfoRow label="Группа" value={student.group} />
								<InfoRow label="Зачётная книжка" value={student.recordBook} />
								<InfoRow label="Почта" value={student.email} />
							</dl>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Landmark className="text-primary size-4" aria-hidden="true" />
								Идентификация через Госуслуги
								<Badge variant="outline">заглушка</Badge>
							</CardTitle>
							<CardDescription>
								В прототипе показана точка интеграции: реальная идентификация не подключена.
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-2">
							<p className="text-muted-foreground text-xs leading-relaxed">
								Зачем это нужно: государственный контур подтверждает подлинность данных — вуз не
								«рисует» оценку, а работодатель видит проверенную запись. При этом личная траектория
								не уходит в гос. контур без согласия: верификация и контроль — не одно и то же.
							</p>
							<Button
								variant="secondary"
								size="sm"
								className="mt-3"
								onClick={() =>
									toast({
										title: 'Верификация ≠ контроль',
										description:
											'Государство подтверждает подлинность записи, но не читает вашу личную траекторию без основания.',
										variant: 'info',
									})
								}
							>
								Что это значит
							</Button>
						</CardContent>
					</Card>

					<Card className="bg-surface-2/60">
						<CardContent className="flex items-start gap-3">
							<ShieldCheck className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
							<div>
								<p className="text-sm font-semibold">152-ФЗ и режим ПДн</p>
								<p className="text-muted-foreground mt-1 text-xs leading-relaxed">
									Персональные данные хранятся в контуре вуза, доступ разграничен по ролям, действия
									логируются. В демо нет реальных персональных данных: все студенты вымышлены.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="flex min-w-0 flex-col gap-4">
					<AccessMap />

					<Card>
						<CardHeader>
							<CardTitle>Настройки демо</CardTitle>
							<CardDescription>
								Переключатели для показа состояний на защите проекта.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-1 pt-2">
							<Switch
								checked={theme === 'dark'}
								onChange={toggleTheme}
								label="Тёмная тема"
								description="Та же палитра, пересчитанная под тёмный фон."
							/>
							<Switch
								checked={chaos}
								onChange={setChaos}
								label="Режим демо-сбоев"
								description="Случайные ошибки сети: показывают состояния загрузки, ошибки и повтор запроса."
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
