import { addDays } from 'date-fns';

import { timeToMinutes, weekdayNumber } from '@/shared/lib/dates';
import type {
	AppNotification,
	Competency,
	Deadline,
	Discipline,
	Lesson,
	RequestTypeOption,
	Student,
	StudentId,
	StudentRequest,
} from './types';

/**
 * Демо-данные прототипа. Все студенты вымышленные, оценки и заявки — синтетические.
 * Даты считаются от «сейчас», чтобы лента «Сегодня» всегда была живой.
 */

const now = new Date();

/** ISO-дата со сдвигом по дням и фиксированным временем. */
function at(dayOffset: number, hour: number, minute = 0): string {
	const date = addDays(now, dayOffset);
	date.setHours(hour, minute, 0, 0);
	return date.toISOString();
}

/** ISO-дата «N часов назад»: прошлые события не должны оказаться в будущем. */
function ago(hours: number, minutes = 0): string {
	return new Date(Date.now() - hours * 3_600_000 - minutes * 60_000).toISOString();
}

export const TEST_ACCOUNTS: { id: StudentId; label: string; hint: string }[] = [
	{ id: 'student-1', label: 'Анна Ковалёва', hint: '2 курс · МЭО · группа МЭО-2-14' },
	{ id: 'student-2', label: 'Тимур Ахметов', hint: '3 курс · МО · группа МО-3-08' },
];

export const STUDENTS: Record<StudentId, Student> = {
	'student-1': {
		id: 'student-1',
		fullName: 'Ковалёва Анна Дмитриевна',
		shortName: 'Анна',
		faculty: 'Международные экономические отношения',
		program: 'Экономика',
		course: 2,
		group: 'МЭО-2-14',
		recordBook: '21-4471',
		email: 'a.kovaleva@student.mgimo.demo',
		identityVerified: true,
		avatarGradient: ['#0D5BD7', '#8FE3C6'],
	},
	'student-2': {
		id: 'student-2',
		fullName: 'Ахметов Тимур Рустамович',
		shortName: 'Тимур',
		faculty: 'Международные отношения',
		program: 'Международные отношения',
		course: 3,
		group: 'МО-3-08',
		recordBook: '20-1908',
		email: 't.akhmetov@student.mgimo.demo',
		identityVerified: true,
		avatarGradient: ['#6A45D8', '#FFC9A8'],
	},
};

/** Расписание: повторяется каждую неделю, 1 — понедельник. */
export const LESSONS: Lesson[] = [
	// ── Анна, 2 курс МЭО ───────────────────────────────────────────────────
	{
		id: 'a-mo-1',
		studentId: 'student-1',
		weekday: 1,
		start: '09:30',
		end: '10:50',
		subject: 'Микроэкономика',
		kind: 'lecture',
		room: '315',
		teacher: 'доц. Е. В. Соколова',
	},
	{
		id: 'a-mo-2',
		studentId: 'student-1',
		weekday: 1,
		start: '11:10',
		end: '12:30',
		subject: 'Английский язык',
		kind: 'seminar',
		room: '208',
		teacher: 'ст. преп. J. Whitmore',
	},
	{
		id: 'a-mo-3',
		studentId: 'student-1',
		weekday: 1,
		start: '13:30',
		end: '14:50',
		subject: 'Статистика',
		kind: 'lab',
		room: '412',
		teacher: 'проф. А. Р. Гайнутдинов',
	},
	{
		id: 'a-tu-1',
		studentId: 'student-1',
		weekday: 2,
		start: '09:30',
		end: '10:50',
		subject: 'История экономических учений',
		kind: 'lecture',
		room: '120',
		teacher: 'проф. О. П. Литвинова',
	},
	{
		id: 'a-tu-2',
		studentId: 'student-1',
		weekday: 2,
		start: '11:10',
		end: '12:30',
		subject: 'Математический анализ',
		kind: 'seminar',
		room: '306',
		teacher: 'доц. И. С. Мельник',
	},
	{
		id: 'a-tu-3',
		studentId: 'student-1',
		weekday: 2,
		start: '15:00',
		end: '16:20',
		subject: 'Международная торговля',
		kind: 'lecture',
		room: '214',
		teacher: 'проф. Н. А. Белова',
		change: {
			previousStart: '13:30',
			previousEnd: '14:50',
			reason: 'преподаватель на конференции',
		},
	},
	{
		id: 'a-we-1',
		studentId: 'student-1',
		weekday: 3,
		start: '09:30',
		end: '10:50',
		subject: 'Английский язык',
		kind: 'seminar',
		room: '208',
		teacher: 'ст. преп. J. Whitmore',
	},
	{
		id: 'a-we-2',
		studentId: 'student-1',
		weekday: 3,
		start: '11:10',
		end: '12:30',
		subject: 'Микроэкономика',
		kind: 'seminar',
		room: '315',
		teacher: 'доц. Е. В. Соколова',
	},
	{
		id: 'a-we-3',
		studentId: 'student-1',
		weekday: 3,
		start: '13:30',
		end: '14:50',
		subject: 'Физическая культура',
		kind: 'seminar',
		room: 'Спортзал',
		teacher: 'А. М. Григорьев',
	},
	{
		id: 'a-th-1',
		studentId: 'student-1',
		weekday: 4,
		start: '09:30',
		end: '10:50',
		subject: 'Статистика',
		kind: 'seminar',
		room: '412',
		teacher: 'проф. А. Р. Гайнутдинов',
	},
	{
		id: 'a-th-2',
		studentId: 'student-1',
		weekday: 4,
		start: '11:10',
		end: '12:30',
		subject: 'Международная торговля',
		kind: 'seminar',
		room: '214',
		teacher: 'проф. Н. А. Белова',
	},
	{
		id: 'a-th-3',
		studentId: 'student-1',
		weekday: 4,
		start: '13:30',
		end: '14:50',
		subject: 'Китайский язык (факультатив)',
		kind: 'seminar',
		room: '507',
		teacher: 'ст. преп. Ли Вэй',
	},
	{
		id: 'a-fr-1',
		studentId: 'student-1',
		weekday: 5,
		start: '09:30',
		end: '10:50',
		subject: 'Экономика России',
		kind: 'lecture',
		room: '101',
		teacher: 'проф. С. Ю. Дорохов',
	},
	{
		id: 'a-fr-2',
		studentId: 'student-1',
		weekday: 5,
		start: '11:10',
		end: '12:30',
		subject: 'Математический анализ',
		kind: 'lecture',
		room: '306',
		teacher: 'доц. И. С. Мельник',
	},
	{
		id: 'a-fr-3',
		studentId: 'student-1',
		weekday: 5,
		start: '13:30',
		end: '14:50',
		subject: 'История',
		kind: 'seminar',
		room: '120',
		teacher: 'проф. О. П. Литвинова',
	},
	{
		id: 'a-sa-1',
		studentId: 'student-1',
		weekday: 6,
		start: '10:00',
		end: '11:20',
		subject: 'Проектный семинар',
		kind: 'seminar',
		room: 'Коворкинг',
		teacher: 'доц. М. А. Ким',
		note: 'Защита промежуточных результатов проекта',
	},
	// ── Тимур, 3 курс МО ───────────────────────────────────────────────────
	{
		id: 't-mo-1',
		studentId: 'student-2',
		weekday: 1,
		start: '10:00',
		end: '11:20',
		subject: 'Теория международных отношений',
		kind: 'lecture',
		room: '220',
		teacher: 'проф. В. Г. Орлов',
	},
	{
		id: 't-mo-2',
		studentId: 'student-2',
		weekday: 1,
		start: '11:40',
		end: '13:00',
		subject: 'Испанский язык',
		kind: 'seminar',
		room: '410',
		teacher: 'ст. преп. M. García',
	},
	{
		id: 't-tu-1',
		studentId: 'student-2',
		weekday: 2,
		start: '09:30',
		end: '10:50',
		subject: 'Международное право',
		kind: 'lecture',
		room: '118',
		teacher: 'доц. К. С. Ефимова',
	},
	{
		id: 't-tu-2',
		studentId: 'student-2',
		weekday: 2,
		start: '11:10',
		end: '12:30',
		subject: 'Регионоведение: Латинская Америка',
		kind: 'seminar',
		room: '305',
		teacher: 'проф. Л. Р. Кастро',
		change: {
			previousStart: '13:30',
			previousEnd: '14:50',
			reason: 'освободилась аудитория',
		},
	},
	{
		id: 't-we-1',
		studentId: 'student-2',
		weekday: 3,
		start: '10:00',
		end: '11:20',
		subject: 'Экономическая дипломатия',
		kind: 'lecture',
		room: '402',
		teacher: 'проф. А. Н. Стрельцов',
	},
	{
		id: 't-th-1',
		studentId: 'student-2',
		weekday: 4,
		start: '09:30',
		end: '10:50',
		subject: 'Испанский язык',
		kind: 'seminar',
		room: '410',
		teacher: 'ст. преп. M. García',
	},
	{
		id: 't-th-2',
		studentId: 'student-2',
		weekday: 4,
		start: '11:10',
		end: '12:30',
		subject: 'Анализ международных конфликтов',
		kind: 'seminar',
		room: '311',
		teacher: 'доц. Р. Т. Хайруллин',
	},
	{
		id: 't-fr-1',
		studentId: 'student-2',
		weekday: 5,
		start: '10:00',
		end: '11:20',
		subject: 'Теория международных отношений',
		kind: 'seminar',
		room: '220',
		teacher: 'проф. В. Г. Орлов',
	},
	{
		id: 't-sa-1',
		studentId: 'student-2',
		weekday: 6,
		start: '11:00',
		end: '12:20',
		subject: 'Модель ООН: подготовка делегации',
		kind: 'seminar',
		room: 'Актовый зал',
		teacher: 'ст. преп. Д. И. Соловьёв',
	},
];

export const DISCIPLINES: Record<StudentId, Discipline[]> = {
	'student-1': [
		{
			id: 'd-micro',
			name: 'Микроэкономика',
			teacher: 'доц. Е. В. Соколова',
			control: 'Экзамен',
			grade: 5,
			credits: 5,
			progress: 82,
			competencyIds: ['c-econ-analysis', 'c-public-speaking'],
		},
		{
			id: 'd-english',
			name: 'Английский язык',
			teacher: 'ст. преп. J. Whitmore',
			control: 'Зачёт',
			grade: 5,
			credits: 4,
			progress: 90,
			competencyIds: ['c-business-english'],
		},
		{
			id: 'd-stats',
			name: 'Статистика',
			teacher: 'проф. А. Р. Гайнутдинов',
			control: 'Экзамен',
			grade: 4,
			credits: 4,
			progress: 74,
			competencyIds: ['c-sql', 'c-econ-analysis'],
		},
		{
			id: 'd-matan',
			name: 'Математический анализ',
			teacher: 'доц. И. С. Мельник',
			control: 'Экзамен',
			grade: 4,
			credits: 5,
			progress: 68,
			competencyIds: ['c-econ-analysis'],
		},
		{
			id: 'd-trade',
			name: 'Международная торговля',
			teacher: 'проф. Н. А. Белова',
			control: 'Курсовая',
			grade: null,
			credits: 3,
			progress: 55,
			competencyIds: ['c-fin-model', 'c-public-speaking'],
		},
		{
			id: 'd-history',
			name: 'История',
			teacher: 'проф. О. П. Литвинова',
			control: 'Зачёт',
			grade: 5,
			credits: 3,
			progress: 88,
			competencyIds: ['c-public-speaking'],
		},
		{
			id: 'd-sport',
			name: 'Физическая культура',
			teacher: 'А. М. Григорьев',
			control: 'Зачёт',
			grade: null,
			credits: 2,
			progress: 61,
			competencyIds: [],
		},
	],
	'student-2': [
		{
			id: 'd-ir-theory',
			name: 'Теория международных отношений',
			teacher: 'проф. В. Г. Орлов',
			control: 'Экзамен',
			grade: 5,
			credits: 5,
			progress: 86,
			competencyIds: ['c-negotiation', 'c-public-speaking'],
		},
		{
			id: 'd-spanish',
			name: 'Испанский язык',
			teacher: 'ст. преп. M. García',
			control: 'Зачёт',
			grade: 5,
			credits: 4,
			progress: 79,
			competencyIds: ['c-spanish'],
		},
		{
			id: 'd-law',
			name: 'Международное право',
			teacher: 'доц. К. С. Ефимова',
			control: 'Экзамен',
			grade: 4,
			credits: 4,
			progress: 71,
			competencyIds: ['c-legal-reading'],
		},
		{
			id: 'd-latam',
			name: 'Регионоведение: Латинская Америка',
			teacher: 'проф. Л. Р. Кастро',
			control: 'Курсовая',
			grade: null,
			credits: 3,
			progress: 62,
			competencyIds: ['c-regional-analysis'],
		},
		{
			id: 'd-econ-dip',
			name: 'Экономическая дипломатия',
			teacher: 'проф. А. Н. Стрельцов',
			control: 'Экзамен',
			grade: 4,
			credits: 4,
			progress: 66,
			competencyIds: ['c-negotiation'],
		},
		{
			id: 'd-conflict',
			name: 'Анализ международных конфликтов',
			teacher: 'доц. Р. Т. Хайруллин',
			control: 'Зачёт',
			grade: null,
			credits: 3,
			progress: 58,
			competencyIds: ['c-regional-analysis', 'c-public-speaking'],
		},
	],
};

export const COMPETENCIES: Record<StudentId, Competency[]> = {
	'student-1': [
		{
			id: 'c-econ-analysis',
			name: 'Эконометрический анализ',
			level: 72,
			status: 'verified',
			discipline: 'Статистика · Микроэкономика',
			market: { vacancies: 1240, salaryLift: '+18 % к медиане' },
		},
		{
			id: 'c-sql',
			name: 'SQL и работа с данными',
			level: 64,
			status: 'verified',
			discipline: 'Статистика',
			market: { vacancies: 2310, salaryLift: '+22 % к медиане' },
		},
		{
			id: 'c-business-english',
			name: 'Деловой английский',
			level: 80,
			status: 'verified',
			discipline: 'Английский язык',
			market: { vacancies: 3040, salaryLift: '+12 % к медиане' },
		},
		{
			id: 'c-fin-model',
			name: 'Финансовое моделирование',
			level: 48,
			status: 'pending',
			discipline: 'Международная торговля',
			market: { vacancies: 870, salaryLift: '+15 % к медиане' },
		},
		{
			id: 'c-public-speaking',
			name: 'Публичная защита решений',
			level: 35,
			status: 'pending',
			discipline: 'Микроэкономика · История',
		},
		{
			id: 'c-chinese',
			name: 'Китайский язык (HSK 3)',
			level: 12,
			status: 'not-started',
			discipline: 'Китайский язык (факультатив)',
			market: { vacancies: 430, salaryLift: '+26 % к медиане' },
		},
	],
	'student-2': [
		{
			id: 'c-negotiation',
			name: 'Переговорная позиция и аргументация',
			level: 74,
			status: 'verified',
			discipline: 'Теория МО · Экономическая дипломатия',
			market: { vacancies: 960, salaryLift: '+19 % к медиане' },
		},
		{
			id: 'c-spanish',
			name: 'Испанский язык: C1',
			level: 79,
			status: 'verified',
			discipline: 'Испанский язык',
			market: { vacancies: 310, salaryLift: '+21 % к медиане' },
		},
		{
			id: 'c-legal-reading',
			name: 'Работа с международными актами',
			level: 68,
			status: 'verified',
			discipline: 'Международное право',
			market: { vacancies: 540, salaryLift: '+9 % к медиане' },
		},
		{
			id: 'c-regional-analysis',
			name: 'Страновой и региональный анализ',
			level: 52,
			status: 'pending',
			discipline: 'Регионоведение · Анализ конфликтов',
			market: { vacancies: 680, salaryLift: '+14 % к медиане' },
		},
		{
			id: 'c-public-speaking',
			name: 'Публичная защита решений',
			level: 61,
			status: 'verified',
			discipline: 'Теория МО · Модель ООН',
		},
	],
};

/** Источник связки «дисциплина → навык» — словарь, а не генерация моделью. */
export const COMPETENCY_SOURCE = {
	label: 'Словарь формулировок + ручная верификация',
	updatedAt: '12.10.2026',
	note: 'Связки собраны из частотных формулировок вакансий и подтверждены сотрудником учебного офиса.',
};

export const REQUEST_TYPES: RequestTypeOption[] = [
	{
		id: 'study-certificate',
		title: 'Справка об обучении',
		description: 'Для банка, визы или работодателя. Электронная версия с отметкой вуза.',
		duration: 'до 1 рабочего дня',
	},
	{
		id: 'record-book-copy',
		title: 'Копия зачётной книжки',
		description: 'Выписка с оценками за текущий семестр, заверенная учебным отделом.',
		duration: 'до 2 рабочих дней',
	},
	{
		id: 'retake-application',
		title: 'Заявление на пересдачу',
		description: 'Назначение даты пересдачи с указанием дисциплины и преподавателя.',
		duration: 'до 3 рабочих дней',
	},
	{
		id: 'academic-leave',
		title: 'Заявление на академический отпуск',
		description: 'Требует подтверждающих документов. Решение принимает деканат.',
		duration: 'до 10 рабочих дней',
	},
];

export const REQUESTS_SEED: StudentRequest[] = [
	{
		id: 'REQ-2418',
		studentId: 'student-1',
		type: 'Справка об обучении',
		comment: 'Нужна для оформления визы, с указанием курса и формы обучения.',
		createdAt: ago(74),
		dueAt: at(0, 18),
		status: 'ready',
		responsible: 'Учебный отдел · окно 2',
		verified: true,
		events: [
			{ at: ago(74), status: 'submitted', comment: 'Заявка принята' },
			{ at: ago(50), status: 'in-progress', comment: 'Проверяет учебный отдел' },
			{ at: ago(19), status: 'ready', comment: 'Справка готова, подписана ЭЦП' },
		],
	},
	{
		id: 'REQ-2402',
		studentId: 'student-1',
		type: 'Заявление на пересдачу',
		comment: 'Математический анализ, комиссия.',
		createdAt: ago(26),
		dueAt: at(2, 18),
		status: 'in-progress',
		responsible: 'Деканат МЭО · Н. П. Ильина',
		verified: false,
		events: [
			{ at: ago(26), status: 'submitted', comment: 'Заявка принята' },
			{ at: ago(1), status: 'in-progress', comment: 'Согласуют дату с преподавателем' },
		],
	},
	{
		id: 'REQ-2388',
		studentId: 'student-1',
		type: 'Копия зачётной книжки',
		comment: 'Для оформления стипендии.',
		createdAt: ago(2),
		dueAt: at(3, 18),
		status: 'submitted',
		responsible: 'Учебный отдел · окно 2',
		verified: false,
		events: [{ at: ago(2), status: 'submitted', comment: 'Заявка принята' }],
	},
	{
		id: 'REQ-1907',
		studentId: 'student-2',
		type: 'Справка об обучении',
		comment: 'Для оформления шенгенской визы.',
		createdAt: ago(50),
		dueAt: at(1, 18),
		status: 'in-progress',
		responsible: 'Учебный отдел · окно 1',
		verified: false,
		events: [
			{ at: ago(50), status: 'submitted', comment: 'Заявка принята' },
			{ at: ago(24), status: 'in-progress', comment: 'Проверяют данные зачётки' },
		],
	},
];

export const NOTIFICATIONS_SEED: AppNotification[] = [
	{
		id: 'n-1',
		studentId: 'student-1',
		priority: 'critical',
		title: 'Пара перенесена: Международная торговля',
		body: 'Сегодня в 15:00 вместо 13:30, аудитория 214. Причина: преподаватель на конференции.',
		createdAt: ago(0, 40),
		read: false,
		action: { label: 'Открыть расписание', to: '/schedule' },
	},
	{
		id: 'n-2',
		studentId: 'student-1',
		priority: 'critical',
		title: 'Курсовая: дедлайн завтра',
		body: 'Работа по международной торговле принимается до 23:59. Черновик уже загружен.',
		createdAt: ago(1, 10),
		read: false,
		action: { label: 'Посмотреть успеваемость', to: '/grades' },
	},
	{
		id: 'n-3',
		studentId: 'student-1',
		priority: 'important',
		title: 'Справка об обучении готова',
		body: 'Заберите в учебном отделе, окно 2, или скачайте электронную версию с ЭЦП.',
		createdAt: ago(19),
		read: false,
		action: { label: 'К заявке', to: '/requests' },
	},
	{
		id: 'n-4',
		studentId: 'student-1',
		priority: 'important',
		title: 'Зачёт по физкультуре — 12 ноября',
		body: 'Нужно сдать нормативы. Запись свободная, приходите в спортзал.',
		createdAt: ago(23),
		read: true,
	},
	{
		id: 'n-5',
		studentId: 'student-1',
		priority: 'info',
		title: 'Открыта запись на электив «Аналитика данных»',
		body: '12 мест, старт 20 ноября. Электив закрывает навык SQL в карте компетенций.',
		createdAt: ago(40),
		read: false,
		action: { label: 'Смотреть карту компетенций', to: '/grades' },
	},
	{
		id: 'n-6',
		studentId: 'student-1',
		priority: 'info',
		title: 'Словарь формулировок обновлён',
		body: 'Добавлено 12 связок «дисциплина → навык». Все связки проверены вручную.',
		createdAt: ago(70),
		read: true,
	},
	{
		id: 'n-7',
		studentId: 'student-2',
		priority: 'critical',
		title: 'Регионоведение: пара перенесена',
		body: 'Сегодня в 11:10 вместо 13:30, аудитория 305.',
		createdAt: ago(0, 55),
		read: false,
		action: { label: 'Открыть расписание', to: '/schedule' },
	},
	{
		id: 'n-8',
		studentId: 'student-2',
		priority: 'important',
		title: 'Справка для визы в работе',
		body: 'Проверяют данные зачётки. Ожидаемый срок — завтра до 18:00.',
		createdAt: ago(27),
		read: false,
		action: { label: 'К заявке', to: '/requests' },
	},
	{
		id: 'n-9',
		studentId: 'student-2',
		priority: 'info',
		title: 'Модель ООН: сбор делегации',
		body: 'В субботу в 11:00 в актовом зале. Подготовьте позицию по повестке.',
		createdAt: ago(50),
		read: true,
	},
];

export const DEADLINES: Deadline[] = [
	{
		id: 'dl-1',
		studentId: 'student-1',
		title: 'Курсовая работа',
		subject: 'Международная торговля',
		dueAt: at(1, 23, 59),
	},
	{
		id: 'dl-2',
		studentId: 'student-1',
		title: 'Эссе',
		subject: 'Английский язык',
		dueAt: at(4, 23, 59),
	},
	{
		id: 'dl-3',
		studentId: 'student-1',
		title: 'Проектная защита',
		subject: 'Проектный семинар',
		dueAt: at(6, 11, 20),
	},
	{
		id: 'dl-4',
		studentId: 'student-2',
		title: 'Курсовая работа',
		subject: 'Регионоведение: Латинская Америка',
		dueAt: at(2, 23, 59),
	},
	{
		id: 'dl-5',
		studentId: 'student-2',
		title: 'Эссе',
		subject: 'Экономическая дипломатия',
		dueAt: at(5, 23, 59),
	},
];

/** Пауза мок-слоя: показывает скелетоны и не даёт «мигать» контенту. */
const MIN_DELAY_MS = 260;
const MAX_DELAY_MS = 520;

/** Флаг «режим демо-сбоев»: включает случайные ошибки для проверки состояний. */
export const CHAOS_STORAGE_KEY = 'dekanat.chaos';

function chaosEnabled(): boolean {
	try {
		return window.localStorage.getItem(CHAOS_STORAGE_KEY) === 'on';
	} catch {
		return false;
	}
}

function delay(): Promise<void> {
	const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Имитация сетевого запроса: задержка + опциональный сбой в «режиме демо-сбоев».
 */
async function network<T>(payload: T): Promise<T> {
	await delay();
	if (chaosEnabled() && Math.random() < 0.4) {
		throw new Error('Демо-сбой сети. Включён режим проверки состояний ошибки.');
	}
	return payload;
}

/** Профиль студента. */
export function fetchStudent(id: StudentId): Promise<Student> {
	return network(STUDENTS[id]);
}

/** Все пары студента на неделю. */
export function fetchLessons(id: StudentId): Promise<Lesson[]> {
	return network(LESSONS.filter((lesson) => lesson.studentId === id));
}

/** Дисциплины с оценками и прогрессом. */
export function fetchDisciplines(id: StudentId): Promise<Discipline[]> {
	return network(DISCIPLINES[id]);
}

/** Карта компетенций. */
export function fetchCompetencies(id: StudentId): Promise<Competency[]> {
	return network(COMPETENCIES[id]);
}

/** Пары на конкретный день недели, отсортированные по времени. */
export function lessonsForWeekday(id: StudentId, weekday: number): Lesson[] {
	return LESSONS.filter((lesson) => lesson.studentId === id && lesson.weekday === weekday).sort(
		(a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
	);
}

/** Пары на конкретную дату. */
export function lessonsForDate(id: StudentId, date: Date): Lesson[] {
	return lessonsForWeekday(id, weekdayNumber(date));
}
