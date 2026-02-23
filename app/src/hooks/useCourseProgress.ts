import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Fetches the set of completed lesson IDs and enrollment status
 * for the current user in a specific course, from the database.
 */
export function useCourseProgress(courseId: string | undefined) {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['course-progress', user?.id, courseId],
    enabled: !!user?.id && !!courseId,
    queryFn: async () => {
      const [completionsRes, enrollmentRes] = await Promise.all([
        supabase
          .from('lesson_completions')
          .select('lesson_id')
          .eq('user_id', user!.id)
          .eq('course_id', courseId!),
        supabase
          .from('enrollments')
          .select('id, enrolled_at')
          .eq('user_id', user!.id)
          .eq('course_id', courseId!)
          .maybeSingle(),
      ]);

      const completedLessonIds = new Set(
        (completionsRes.data ?? []).map((r) => r.lesson_id)
      );

      return {
        completedLessonIds,
        isEnrolled: !!enrollmentRes.data,
        enrolledAt: enrollmentRes.data?.enrolled_at ?? null,
      };
    },
  });

  return {
    completedLessonIds: data?.completedLessonIds ?? new Set<string>(),
    isEnrolled: data?.isEnrolled ?? false,
    enrolledAt: data?.enrolledAt ?? null,
    isLoading,
    refetch,
  };
}
