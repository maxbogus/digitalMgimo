/** Тестовые аккаунты прототипа. */
export type StudentId = 'student-1' | 'student-2';

export interface Student {
	id: StudentId;
	fullName: string;
	shortName: string;
	faculty: string;
	program: string;
	course: number;
	group: string;
	recordBook: string;
	email: string;
	/** Данные подтверждены государственным контуром (заглушка Госуслуг). */
	identityVerified: boolean;
	/** Тёмный и светлый оттенки для градиента аватара. */
	avatarGradient: [string, string];
}

export type LessonKind = 'lecture' | 'seminar' | 'lab' | 'exam';

/** Изменение в расписании: показываем и старую, и новую строку. */
export interface ScheduleChange {
	previousStart: string;
	previousEnd: string;
	reason: string;
}

export interface Lesson {
	id: string;
	studentId: StudentId;
	/** 1 — понедельник … 7 — воскресенье. */
	weekday: number;
	start: string;
	end: string;
	subject: string;
	kind: LessonKind;
	room: string;
	teacher: string;
	change?: ScheduleChange;
	note?: string;
}

export interface Discipline {
	id: string;
	name: string;
	teacher: string;
	control: 'Экзамен' | 'Зачёт' | 'Курсовая';
	/** null — ещё не выставлена. */
	grade: 2 | 3 | 4 | 5 | null;
	credits: number;
	/** Прогресс освоения, 0–100. */
	progress: number;
	competencyIds: string[];
}

export type CompetencyStatus = 'verified' | 'pending' | 'not-started';

export interface Competency {
	id: string;
	name: string;
	/** 0–100. */
	level: number;
	status: CompetencyStatus;
	discipline: string;
	/** Привязка к рынку труда из «словаря формулировок». */
	market?: {
		vacancies: number;
		salaryLift: string;
	};
}

export type RequestStatus = 'submitted' | 'in-progress' | 'ready' | 'rejected';

export interface RequestEvent {
	at: string;
	status: RequestStatus;
	comment: string;
}

export interface StudentRequest {
	id: string;
	studentId: StudentId;
	type: string;
	comment?: string;
	createdAt: string;
	/** null — срок пока не назначен. */
	dueAt: string | null;
	status: RequestStatus;
	responsible: string;
	verified: boolean;
	events: RequestEvent[];
}

export type NotificationPriority = 'critical' | 'important' | 'info';

export interface AppNotification {
	id: string;
	studentId: StudentId;
	priority: NotificationPriority;
	title: string;
	body: string;
	createdAt: string;
	read: boolean;
	action?: {
		label: string;
		to: string;
	};
}

/** Дедлайн по дисциплине — для блока «на неделе». */
export interface Deadline {
	id: string;
	studentId: StudentId;
	title: string;
	subject: string;
	/** ISO-дата сдачи. */
	dueAt: string;
}

/** Тип заявки для трёхшаговой формы. */
export interface RequestTypeOption {
	id: string;
	title: string;
	description: string;
	duration: string;
}
