import { useQuery } from '@tanstack/react-query';
import { contentService } from './content-service';

/**
 * React Query hooks for CMS content.
 * Automatically fetches from Sanity when configured, otherwise uses mock data.
 */

export function useCourses() {
  return useQuery({
    queryKey: ['cms', 'courses'],
    queryFn: () => contentService.getCourses(),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

export function useCourseBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['cms', 'course', slug],
    queryFn: () => contentService.getCourseBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLearningPaths() {
  return useQuery({
    queryKey: ['cms', 'learningPaths'],
    queryFn: () => contentService.getLearningPaths(),
    staleTime: 5 * 60 * 1000,
  });
}
