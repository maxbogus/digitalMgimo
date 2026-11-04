import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { Competency, Discipline, Lesson, Student, StudentId } from './types';
import { fetchCompetencies, fetchDisciplines, fetchLessons, fetchStudent } from './mock';

/** Профиль студента из мок-слоя. */
export function useStudent(id: StudentId): UseQueryResult<Student> {
	return useQuery({
		queryKey: ['student', id],
		queryFn: () => fetchStudent(id),
		staleTime: 5 * 60_000,
	});
}

/** Пары студента на неделю. */
export function useLessons(id: StudentId): UseQueryResult<Lesson[]> {
	return useQuery({
		queryKey: ['lessons', id],
		queryFn: () => fetchLessons(id),
		staleTime: 5 * 60_000,
	});
}

/** Дисциплины и прогресс. */
export function useDisciplines(id: StudentId): UseQueryResult<Discipline[]> {
	return useQuery({
		queryKey: ['disciplines', id],
		queryFn: () => fetchDisciplines(id),
		staleTime: 5 * 60_000,
	});
}

/** Карта компетенций. */
export function useCompetencies(id: StudentId): UseQueryResult<Competency[]> {
	return useQuery({
		queryKey: ['competencies', id],
		queryFn: () => fetchCompetencies(id),
		staleTime: 5 * 60_000,
	});
}
