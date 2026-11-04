import { beforeEach, describe, expect, it } from 'vitest';

import { selectRequests, selectUnreadCount, useAppStore } from '@/app/store/app.store';
import { NOTIFICATIONS_SEED, REQUESTS_SEED } from '@/shared/api/mock';

function resetStore(): void {
	useAppStore.setState({
		studentId: null,
		theme: 'light',
		chaos: false,
		requests: REQUESTS_SEED,
		notifications: NOTIFICATIONS_SEED,
		channels: { critical: true, important: true, info: true },
	});
}

describe('app.store', () => {
	beforeEach(resetStore);

	it('вход и выход управляют сессией', () => {
		useAppStore.getState().signIn('student-2');
		expect(useAppStore.getState().studentId).toBe('student-2');

		useAppStore.getState().signOut();
		expect(useAppStore.getState().studentId).toBeNull();
	});

	it('показывает только заявки текущего студента', () => {
		useAppStore.getState().signIn('student-2');
		const requests = selectRequests(useAppStore.getState());

		expect(requests.length).toBeGreaterThan(0);
		expect(requests.every((request) => request.studentId === 'student-2')).toBe(true);
	});

	it('создаёт заявку в статусе «отправлена»', () => {
		useAppStore.getState().signIn('student-1');
		const created = useAppStore
			.getState()
			.createRequest({ type: 'Справка об обучении', comment: 'для визы' });

		expect(created.status).toBe('submitted');
		expect(created.studentId).toBe('student-1');
		expect(created.events).toHaveLength(1);
		expect(selectRequests(useAppStore.getState())[0]?.id).toBe(created.id);
	});

	it('продвигает статус submitted → in-progress → ready и ставит верификацию', () => {
		useAppStore.getState().signIn('student-1');
		const created = useAppStore.getState().createRequest({ type: 'Копия зачётной книжки' });

		useAppStore.getState().advanceRequest(created.id);
		let updated = useAppStore.getState().requests.find((item) => item.id === created.id);
		expect(updated?.status).toBe('in-progress');
		expect(updated?.verified).toBe(false);

		useAppStore.getState().advanceRequest(created.id);
		updated = useAppStore.getState().requests.find((item) => item.id === created.id);
		expect(updated?.status).toBe('ready');
		expect(updated?.verified).toBe(true);
		expect(updated?.events).toHaveLength(3);
	});

	it('не двигает статус готовой заявки', () => {
		const ready = REQUESTS_SEED.find((item) => item.status === 'ready');
		expect(ready).toBeDefined();
		if (!ready) return;

		useAppStore.getState().advanceRequest(ready.id);
		const updated = useAppStore.getState().requests.find((item) => item.id === ready.id);
		expect(updated?.status).toBe('ready');
		expect(updated?.events).toHaveLength(ready.events.length);
	});

	it('критичный канал нельзя отключить', () => {
		useAppStore.getState().setChannel('critical', false);
		expect(useAppStore.getState().channels.critical).toBe(true);

		useAppStore.getState().setChannel('info', false);
		expect(useAppStore.getState().channels.info).toBe(false);
	});

	it('отключённый канал убирает уведомления из выдачи', () => {
		useAppStore.getState().signIn('student-1');
		useAppStore.getState().setChannel('info', false);

		const unreadBefore = selectUnreadCount(useAppStore.getState());
		useAppStore.getState().markAllRead();
		expect(selectUnreadCount(useAppStore.getState())).toBeLessThan(unreadBefore);
		expect(selectUnreadCount(useAppStore.getState())).toBe(0);
	});
});
