import { CalendarDays, FileText, GraduationCap, House, UserRound } from 'lucide-react';

export interface NavItem {
	to: string;
	label: string;
	shortLabel: string;
	icon: typeof House;
}

/** Единый список разделов для десктопного меню и мобильной навигации. */
export const NAV_ITEMS: NavItem[] = [
	{ to: '/', label: 'Сегодня', shortLabel: 'Сегодня', icon: House },
	{ to: '/schedule', label: 'Расписание', shortLabel: 'Пары', icon: CalendarDays },
	{ to: '/grades', label: 'Успеваемость', shortLabel: 'Оценки', icon: GraduationCap },
	{ to: '/requests', label: 'Заявки и справки', shortLabel: 'Заявки', icon: FileText },
	{ to: '/profile', label: 'Профиль', shortLabel: 'Профиль', icon: UserRound },
];
