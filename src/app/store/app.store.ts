import { addDays } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { CHAOS_STORAGE_KEY, NOTIFICATIONS_SEED, REQUESTS_SEED } from '@/shared/api/mock';
import type {
	AppNotification,
	NotificationPriority,
	StudentId,
	StudentRequest,
} from '@/shared/api/types';

export type Theme = 'light' | 'dark';

interface CreateRequestInput {
	type: string;
	comment?: string;
}

interface AppState {
	studentId: StudentId | null;
	theme: Theme;
	/** Режим демо-сбоев: имитация ошибок сети для показа состояний. */
	chaos: boolean;
	requests: StudentRequest[];
	notifications: AppNotification[];
	/** Каналы уведомлений: критичный отключить нельзя. */
	channels: Record<NotificationPriority, boolean>;

	signIn: (id: StudentId) => void;
	signOut: () => void;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
	setChaos: (enabled: boolean) => void;
	setChannel: (priority: NotificationPriority, enabled: boolean) => void;
	createRequest: (input: CreateRequestInput) => StudentRequest;
	advanceRequest: (id: string) => void;
	markNotificationRead: (id: string) => void;
	markAllRead: () => void;
}

function syncChaosFlag(enabled: boolean): void {
	try {
		window.localStorage.setItem(CHAOS_STORAGE_KEY, enabled ? 'on' : 'off');
	} catch {
		// Приватный режим: флаг живёт только в памяти стора.
	}
}

/** Демо-статус заявки: «в работе» → «готова», дальше не двигаем. */
function nextStatus(current: StudentRequest['status']): StudentRequest['status'] {
	if (current === 'submitted') return 'in-progress';
	if (current === 'in-progress') return 'ready';
	return current;
}

/**
 * Безопасная обёртка над localStorage: приватный режим и среда тестов
 * не должны ломать приложение. Ошибки записи гасим осознанно.
 */
const guardedStorage: StateStorage = {
	getItem: (name) => {
		try {
			return window.localStorage?.getItem?.(name) ?? null;
		} catch {
			return null;
		}
	},
	setItem: (name, value) => {
		try {
			window.localStorage?.setItem?.(name, value);
		} catch {
			// Хранилище недоступно — состояние живёт только в памяти.
		}
	},
	removeItem: (name) => {
		try {
			window.localStorage?.removeItem?.(name);
		} catch {
			// см. выше
		}
	},
};

const STATUS_COMMENT: Record<StudentRequest['status'], string> = {
	submitted: 'Заявка принята',
	'in-progress': 'Взято в работу',
	ready: 'Готово, можно забирать',
	rejected: 'Отклонено',
};

/**
 * Клиентское состояние прототипа: сессия, тема, заявки и уведомления.
 * Персистится в localStorage — демо переживает перезагрузку страницы.
 */
export const useAppStore = create<AppState>()(
	persist(
		(set, get) => ({
			studentId: null,
			theme: 'light',
			chaos: false,
			requests: REQUESTS_SEED,
			notifications: NOTIFICATIONS_SEED,
			channels: { critical: true, important: true, info: true },

			signIn: (id) => set({ studentId: id }),

			signOut: () => set({ studentId: null }),

			toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),

			setTheme: (theme) => set({ theme }),

			setChaos: (enabled) => {
				syncChaosFlag(enabled);
				set({ chaos: enabled });
			},

			setChannel: (priority, enabled) => {
				// Критичные уведомления — часть требований безопасности, их не выключаем.
				if (priority === 'critical') return;
				set({ channels: { ...get().channels, [priority]: enabled } });
			},

			createRequest: ({ type, comment }) => {
				const studentId = get().studentId ?? 'student-1';
				const now = new Date();
				const due = addDays(now, 2);
				due.setHours(18, 0, 0, 0);

				const created: StudentRequest = {
					id: `REQ-${2420 + get().requests.length}`,
					studentId,
					type,
					comment,
					createdAt: now.toISOString(),
					dueAt: due.toISOString(),
					status: 'submitted',
					responsible: 'Учебный отдел · окно 2',
					verified: false,
					events: [
						{
							at: now.toISOString(),
							status: 'submitted',
							comment: 'Заявка принята, срок — 2 рабочих дня',
						},
					],
				};

				set({ requests: [created, ...get().requests] });
				return created;
			},

			advanceRequest: (id) => {
				set({
					requests: get().requests.map((request) => {
						if (request.id !== id) return request;
						const status = nextStatus(request.status);
						if (status === request.status) return request;
						return {
							...request,
							status,
							verified: status === 'ready' ? true : request.verified,
							events: [
								...request.events,
								{
									at: new Date().toISOString(),
									status,
									comment: STATUS_COMMENT[status],
								},
							],
						};
					}),
				});
			},

			markNotificationRead: (id) => {
				set({
					notifications: get().notifications.map((item) =>
						item.id === id ? { ...item, read: true } : item,
					),
				});
			},

			markAllRead: () => {
				const studentId = get().studentId;
				set({
					notifications: get().notifications.map((item) =>
						item.studentId === studentId ? { ...item, read: true } : item,
					),
				});
			},
		}),
		{
			name: 'dekanat.state',
			version: 1,
			storage: createJSONStorage(() => guardedStorage),
			partialize: (state) => ({
				studentId: state.studentId,
				theme: state.theme,
				chaos: state.chaos,
				requests: state.requests,
				notifications: state.notifications,
				channels: state.channels,
			}),
		},
	),
);

/** Уведомления текущего студента с учётом выключенных каналов. */
export function selectVisibleNotifications(state: AppState): AppNotification[] {
	return state.notifications
		.filter((item) => item.studentId === state.studentId && state.channels[item.priority])
		.sort((a, b) => Number(a.read) - Number(b.read) || b.createdAt.localeCompare(a.createdAt));
}

/** Непрочитанные уведомления текущего студента — для бейджа в шапке. */
export function selectUnreadCount(state: AppState): number {
	return state.notifications.filter((item) => item.studentId === state.studentId && !item.read)
		.length;
}

/** Заявки текущего студента, новые сверху. */
export function selectRequests(state: AppState): StudentRequest[] {
	return state.requests
		.filter((request) => request.studentId === state.studentId)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
