import { Bell, Moon, Sun } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { selectUnreadCount, useAppStore } from '@/app/store/app.store';
import { STUDENTS } from '@/shared/api/mock';
import { Avatar } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/cn';
import { BottomNav } from './bottom-nav';
import { NAV_ITEMS } from './nav-items';

/** Логотип-марка: академическая шапочка в квадрате бренда. */
function BrandMark() {
	return (
		<svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true" className="shrink-0">
			<rect width="32" height="32" rx="9" fill="var(--brand)" />
			<path d="M8 13.5 16 10l8 3.5-8 3.5-8-3.5Z" fill="#F4F7FB" />
			<path
				d="M10 15.5V19c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.5"
				stroke="#8FE3C6"
				strokeWidth="1.6"
				fill="none"
				strokeLinecap="round"
			/>
			<circle cx="13" cy="10.6" r="1.5" fill="var(--brand)" />
			<circle cx="19" cy="10.6" r="1.5" fill="var(--brand)" />
		</svg>
	);
}

/**
 * Оболочка кабинета: шапка, десктопное меню, мобильная нижняя навигация.
 * Шапка липкая, с полупрозрачным фоном — контент не «прыгает» при скролле.
 */
export function AppShell() {
	const studentId = useAppStore((state) => state.studentId);
	const theme = useAppStore((state) => state.theme);
	const toggleTheme = useAppStore((state) => state.toggleTheme);
	const unread = useAppStore(selectUnreadCount);

	const student = studentId ? STUDENTS[studentId] : null;

	return (
		<div className="bg-background flex min-h-dvh flex-col">
			<a
				href="#main"
				className="focus:rounded-control focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
			>
				Перейти к содержимому
			</a>

			<header className="border-border/80 bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
				<div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 md:px-6">
					<Link
						to="/"
						className="rounded-control focus-visible:ring-ring/25 flex items-center gap-2.5 focus-visible:ring-4 focus-visible:outline-none"
					>
						<BrandMark />
						<span className="flex flex-col leading-tight">
							<span className="text-[15px] font-bold tracking-tight">Цифровой деканат</span>
							<span className="text-muted-foreground text-[11px]">МГИМО · демо-прототип</span>
						</span>
					</Link>

					<nav aria-label="Основная навигация" className="ml-6 hidden flex-1 md:block">
						<ul className="flex items-center gap-1">
							{NAV_ITEMS.map((item) => (
								<li key={item.to}>
									<NavLink
										to={item.to}
										end={item.to === '/'}
										className={({ isActive }) =>
											cn(
												'rounded-control inline-flex min-h-10 items-center gap-2 px-3 text-sm font-semibold transition-colors',
												isActive
													? 'bg-primary-soft text-primary'
													: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
											)
										}
									>
										<item.icon className="size-[17px]" aria-hidden="true" />
										{item.label}
									</NavLink>
								</li>
							))}
						</ul>
					</nav>

					<div className="ml-auto flex items-center gap-1">
						<Link
							to="/notifications"
							aria-label={unread > 0 ? `Уведомления, непрочитанных: ${unread}` : 'Уведомления'}
							className="text-muted-foreground hover:bg-surface-2 hover:text-foreground focus-visible:ring-ring/25 relative inline-flex size-11 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
						>
							<Bell className="size-5" aria-hidden="true" />
							{unread > 0 ? (
								<span className="tabular bg-danger absolute top-1.5 right-1.5 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-bold text-white">
									{unread}
								</span>
							) : null}
						</Link>

						<button
							type="button"
							onClick={toggleTheme}
							aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
							className="text-muted-foreground hover:bg-surface-2 hover:text-foreground focus-visible:ring-ring/25 inline-flex size-11 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
						>
							{theme === 'light' ? (
								<Moon className="size-5" aria-hidden="true" />
							) : (
								<Sun className="size-5" aria-hidden="true" />
							)}
						</button>

						{student ? (
							<Link
								to="/profile"
								className="focus-visible:ring-ring/25 ml-1 rounded-full focus-visible:ring-4 focus-visible:outline-none"
							>
								<Avatar
									name={student.fullName}
									gradient={student.avatarGradient}
									size="sm"
									className="md:size-10"
								/>
								<span className="sr-only">Профиль: {student.fullName}</span>
							</Link>
						) : null}
					</div>
				</div>
			</header>

			<main
				id="main"
				className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 md:px-6 md:pt-7 md:pb-10"
			>
				<Outlet />
			</main>

			<BottomNav />
		</div>
	);
}
