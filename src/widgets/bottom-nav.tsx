import { NavLink } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { NAV_ITEMS } from './nav-items';

/**
 * Нижняя навигация для мобильных: 5 разделов, тач-таргеты 44 px,
 * учитывает safe-area на iPhone.
 */
export function BottomNav() {
	return (
		<nav
			aria-label="Основная навигация"
			className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
		>
			<ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
				{NAV_ITEMS.map((item) => (
					<li key={item.to} className="flex-1">
						<NavLink
							to={item.to}
							end={item.to === '/'}
							className={({ isActive }) =>
								cn(
									'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-semibold transition-colors',
									isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
								)
							}
						>
							{({ isActive }) => (
								<>
									<span
										className={cn(
											'flex size-9 items-center justify-center rounded-full transition-colors',
											isActive && 'bg-primary-soft',
										)}
									>
										<item.icon className="size-[19px]" aria-hidden="true" />
									</span>
									{item.shortLabel}
								</>
							)}
						</NavLink>
					</li>
				))}
			</ul>
		</nav>
	);
}
