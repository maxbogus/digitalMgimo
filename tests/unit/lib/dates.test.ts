import { describe, expect, it } from 'vitest';

import {
	deadlineLabel,
	formatDateTime,
	humanInterval,
	minutesToTime,
	pluralize,
	timeToMinutes,
	weekdayNumber,
} from '@/shared/lib/dates';

describe('timeToMinutes / minutesToTime', () => {
	it('переводит время в минуты и обратно', () => {
		expect(timeToMinutes('09:30')).toBe(570);
		expect(timeToMinutes('00:00')).toBe(0);
		expect(minutesToTime(570)).toBe('09:30');
		expect(minutesToTime(0)).toBe('00:00');
	});
});

describe('pluralize', () => {
	const forms: [string, string, string] = ['пара', 'пары', 'пар'];

	it('выбирает форму по правилам русского языка', () => {
		expect(pluralize(1, forms)).toBe('пара');
		expect(pluralize(2, forms)).toBe('пары');
		expect(pluralize(5, forms)).toBe('пар');
		expect(pluralize(11, forms)).toBe('пар');
		expect(pluralize(21, forms)).toBe('пара');
	});
});

describe('humanInterval', () => {
	const base = new Date('2026-11-04T12:00:00');

	it('описывает ближайшее будущее', () => {
		expect(humanInterval(new Date('2026-11-04T12:20:00'), base)).toBe('через 20 минут');
	});

	it('описывает прошедшее время', () => {
		expect(humanInterval(new Date('2026-11-04T10:00:00'), base)).toBe('2 часа назад');
	});

	it('обрабатывает «прямо сейчас»', () => {
		expect(humanInterval(base, base)).toBe('прямо сейчас');
	});
});

describe('deadlineLabel', () => {
	const base = new Date('2026-11-04T09:00:00');

	it('сегодня — без числа', () => {
		expect(deadlineLabel('2026-11-04T23:59:00', base)).toBe('сегодня');
	});

	it('ближайшие сутки — «завтра»', () => {
		expect(deadlineLabel('2026-11-05T09:30:00', base)).toBe('завтра');
	});
});

describe('formatDateTime', () => {
	it('форматирует по-русски', () => {
		const formatted = formatDateTime('2026-11-04T18:05:00');
		expect(formatted).toContain('18:05');
		expect(formatted).toContain('ноя');
	});
});

describe('weekdayNumber', () => {
	it('воскресенье — 7, понедельник — 1', () => {
		expect(weekdayNumber(new Date('2026-11-09T10:00:00'))).toBe(1);
		expect(weekdayNumber(new Date('2026-11-08T10:00:00'))).toBe(7);
	});
});
