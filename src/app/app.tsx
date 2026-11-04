import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { useAppStore } from '@/app/store/app.store';
import { GradesPage } from '@/pages/grades-page';
import { LoginPage } from '@/pages/login-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { NotificationsPage } from '@/pages/notifications-page';
import { ProfilePage } from '@/pages/profile-page';
import { RequestsPage } from '@/pages/requests-page';
import { SchedulePage } from '@/pages/schedule-page';
import { TodayPage } from '@/pages/today-page';
import { AppShell } from '@/widgets/app-shell';
import { Toaster } from '@/shared/ui/toast';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 0,
			refetchOnWindowFocus: false,
		},
	},
});

/** Применяет выбранную тему к <html>: класс dark включает тёмные токены. */
function useThemeEffect(): void {
	const theme = useAppStore((state) => state.theme);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle('dark', theme === 'dark');
		root.style.colorScheme = theme;
	}, [theme]);
}

/** Пускает в кабинет только «авторизованного» студента. */
function RequireAuth({ children }: { children: ReactNode }) {
	const studentId = useAppStore((state) => state.studentId);
	if (!studentId) {
		return <Navigate to="/login" replace />;
	}
	return <>{children}</>;
}

/**
 * Корень приложения: провайдеры, тема и маршруты.
 * Маршруты закрыты RequireAuth — прямой заход на /grades без сессии уводит на вход.
 */
export function App() {
	useThemeEffect();

	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route
						element={
							<RequireAuth>
								<AppShell />
							</RequireAuth>
						}
					>
						<Route path="/" element={<TodayPage />} />
						<Route path="/schedule" element={<SchedulePage />} />
						<Route path="/grades" element={<GradesPage />} />
						<Route path="/requests" element={<RequestsPage />} />
						<Route path="/notifications" element={<NotificationsPage />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="*" element={<NotFoundPage />} />
					</Route>
				</Routes>
				<Toaster />
			</BrowserRouter>
		</QueryClientProvider>
	);
}
