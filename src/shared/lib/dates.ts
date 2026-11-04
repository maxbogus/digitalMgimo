import {
	addDays,
	differenceInCalendarDays,
	differenceInMinutes,
	format,
	isSameDay,
	parseISO,
	startOfDay,
	startOfWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale/ru';

/** Русская локаль для всех дат прототипа. */
export const RU_LOCALE = ru;

/**
 * Переводит «ЧЧ:ММ» в минуты от начала суток — удобно сравнивать и сортировать.
 */
export function timeToMinutes(time: string): number {
	const [hours = '0', minutes = '0'] = time.split(':');
	return Number(hours) * 60 + Number(minutes);
}

/**
 * Минуты от начала суток → «ЧЧ:ММ».
 */
export function minutesToTime(total: number): string {
	const hours = Math.floor(total / 60);
	const minutes = total % 60;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** «09:30 – 10:50» с типографским тире. */
export function formatTimeRange(start: string, end: string): string {
	return `${start} – ${end}`;
}

/** «вторник, 4 ноября» */
export function formatDayLong(date: Date): string {
	return format(date, 'EEEE, d MMMM', { locale: RU_LOCALE });
}

/** «4 ноября» */
export function formatDayShort(date: Date): string {
	return format(date, 'd MMMM', { locale: RU_LOCALE });
}

/** «4 ноя» — для компактных списков. */
export function formatDateShort(iso: string): string {
	return format(parseISO(iso), 'd MMM', { locale: RU_LOCALE });
}

/** «4 ноя, 18:00» — для сроков и истории заявок. */
export function formatDateTime(iso: string): string {
	return format(parseISO(iso), 'd MMM, HH:mm', { locale: RU_LOCALE });
}

/** «вт» */
export function formatWeekdayShort(date: Date): string {
	return format(date, 'EEEEEE', { locale: RU_LOCALE });
}

/**
 * Склонение существительного: pluralize(2, ['минута', 'минуты', 'минут']) → «минуты».
 */
export function pluralize(count: number, forms: [string, string, string]): string {
	const abs = Math.abs(count) % 100;
	const last = abs % 10;
	if (abs > 10 && abs < 20) return forms[2];
	if (last > 1 && last < 5) return forms[1];
	if (last === 1) return forms[0];
	return forms[2];
}

/** Человеческий интервал: «через 20 минут», «2 часа назад», «только что». */
export function humanInterval(target: Date, now: Date = new Date()): string {
	const diff = differenceInMinutes(target, now);
	const isPast = diff < 0;
	const abs = Math.abs(diff);

	const phrase = (value: number, unit: [string, string, string]): string =>
		`${value} ${pluralize(value, unit)}`;

	if (abs < 1) return 'прямо сейчас';
	if (abs < 60) {
		const text = phrase(abs, ['минуту', 'минуты', 'минут']);
		return isPast ? `${text} назад` : `через ${text}`;
	}
	if (abs < 60 * 24) {
		const hours = Math.round(abs / 60);
		const text = phrase(hours, ['час', 'часа', 'часов']);
		return isPast ? `${text} назад` : `через ${text}`;
	}
	const days = Math.round(abs / (60 * 24));
	const text = phrase(days, ['день', 'дня', 'дней']);
	return isPast ? `${text} назад` : `через ${text}`;
}

/** Начало текущей недели (понедельник), 00:00. */
export function weekStart(date: Date = new Date()): Date {
	return startOfWeek(date, { weekStartsOn: 1 });
}

/** Дни текущей недели: 7 дат с понедельника. */
export function weekDays(date: Date = new Date()): Date[] {
	const start = weekStart(date);
	return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

/** Номер дня недели в формате расписания: 1 — понедельник … 7 — воскресенье. */
export function weekdayNumber(date: Date): number {
	const jsDay = date.getDay();
	return jsDay === 0 ? 7 : jsDay;
}

/** Сегодняшняя дата без времени (для сравнений). */
export function today(): Date {
	return startOfDay(new Date());
}

/** true, если ISO-дата приходится на сегодня. */
export function isToday(iso: string): boolean {
	return isSameDay(parseISO(iso), new Date());
}

/** «через 3 дня» / «сегодня» / «завтра» для дедлайнов. */
export function deadlineLabel(iso: string, now: Date = new Date()): string {
	const target = parseISO(iso);
	const dayDiff = differenceInCalendarDays(target, now);
	if (dayDiff === 0) return 'сегодня';
	if (dayDiff === 1) return 'завтра';
	return humanInterval(target, now);
}
