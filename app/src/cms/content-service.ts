import { getSanityClient, isSanityConfigured } from './sanity-client';
import { QUERIES } from './sanity-queries';
import { MOCK_COURSES, MOCK_LEARNING_PATHS } from '@/services/mock-data';
import { supabase } from '@/integrations/supabase/client';
import type { Course } from '@/services/types';

/**
 * CMS Content Service
 * 
 * Fetches course content from Sanity CMS when configured,
 * falls back to mock data for development / offline mode.
 */

interface LearningPath {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  courseIds: string[];
}

// Transform Sanity response to app Course type
function transformSanityCourse(raw: any): Course {
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description || '',
    shortDescription: raw.shortDescription || '',
    difficulty: raw.difficulty || 'beginner',
    duration: raw.duration || '',
    xpReward: raw.xpReward || 0,
    thumbnail: raw.thumbnail || '',
    track: raw.track || '',
    tags: raw.tags || [],
    enrolledCount: raw.enrolledCount || 0,
    instructor: {
      name: raw.instructor?.name || 'Unknown',
      avatar: raw.instructor?.avatar || '',
      bio: raw.instructor?.bio || '',
    },
    modules: (raw.modules || []).map((mod: any) => ({
      id: mod._id,
      title: mod.title,
      lessons: (mod.lessons || []).map((lesson: any) => ({
        id: lesson._id,
        title: lesson.title,
        type: lesson.type || 'content',
        content: lesson.content || '',
        xpReward: lesson.xpReward || 20,
        challenge: lesson.challenge ? {
          instructions: lesson.challenge.instructions || '',
          starterCode: lesson.challenge.starterCode || '',
          expectedOutput: lesson.challenge.expectedOutput || '',
          language: lesson.challenge.language || 'typescript',
          testCases: (lesson.challenge.testCases || []).map((tc: any) => ({
            name: tc.name,
            input: tc.input || '',
            expected: tc.expected || '',
          })),
        } : undefined,
      })),
    })),
  };
}

function transformLearningPath(raw: any): LearningPath {
  return {
    id: raw._id,
    name: raw.name,
    description: raw.description || '',
    icon: raw.icon || '📚',
    color: raw.color || 'from-primary to-primary/60',
    courseIds: raw.courseIds || [],
  };
}

// Transform database row to app Course type
function transformDBCourse(raw: any): Course {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description || '',
    shortDescription: raw.short_description || '',
    difficulty: raw.difficulty || 'beginner',
    duration: raw.duration || '',
    xpReward: raw.xp_reward || 0,
    thumbnail: raw.thumbnail || '',
    track: raw.track || '',
    tags: raw.tags || [],
    enrolledCount: raw.enrolled_count || 0,
    instructor: {
      name: raw.instructor_name || 'Unknown',
      avatar: raw.instructor_avatar || '',
      bio: raw.instructor_bio || '',
    },
    modules: (raw.course_modules || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        lessons: (mod.lessons || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type || 'content',
            content: lesson.content || '',
            xpReward: lesson.xp_reward || 20,
            videoUrl: lesson.video_url || undefined,
            challenge: lesson.type === 'challenge' ? {
              instructions: lesson.challenge_instructions || '',
              starterCode: lesson.challenge_starter_code || '',
              expectedOutput: lesson.challenge_expected_output || '',
              language: lesson.challenge_language || 'typescript',
              testCases: (lesson.lesson_test_cases || [])
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((tc: any) => ({
                  name: tc.name,
                  input: tc.input || '',
                  expected: tc.expected || '',
                })),
            } : undefined,
          })),
      })),
  };
}

export const contentService = {
  async getCourses(): Promise<Course[]> {
    // Priority 1: database (published courses)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id, title, sort_order,
            lessons (
              id, title, type, content, xp_reward, sort_order, video_url,
              challenge_instructions, challenge_starter_code,
              challenge_expected_output, challenge_language,
              lesson_test_cases (id, name, input, expected, sort_order)
            )
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        console.info(`[CMS] Loaded ${data.length} courses from database`);
        return data.map(transformDBCourse);
      }
    } catch (err) {
      console.warn('[CMS] Database fetch failed:', err);
    }

    // Priority 2: Sanity CMS
    if (isSanityConfigured()) {
      try {
        const client = await getSanityClient();
        const raw = await client.fetch(QUERIES.allCourses);
        return raw.map(transformSanityCourse);
      } catch (err) {
        console.warn('[CMS] Sanity fetch failed, falling back to mock data:', err);
      }
    }

    // Priority 3: Mock data fallback
    console.info('[CMS] Using mock data fallback');
    return MOCK_COURSES;
  },

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    // Priority 1: database
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id, title, sort_order,
            lessons (
              id, title, type, content, xp_reward, sort_order, video_url,
              challenge_instructions, challenge_starter_code,
              challenge_expected_output, challenge_language,
              lesson_test_cases (id, name, input, expected, sort_order)
            )
          )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (!error && data) {
        return transformDBCourse(data);
      }
    } catch (err) {
      console.warn('[CMS] Database fetch failed:', err);
    }

    // Priority 2: Sanity
    if (isSanityConfigured()) {
      try {
        const client = await getSanityClient();
        const raw = await client.fetch(QUERIES.courseBySlug, { slug });
        return raw ? transformSanityCourse(raw) : undefined;
      } catch (err) {
        console.warn('[CMS] Sanity fetch failed:', err);
      }
    }

    // Priority 3: Mock fallback
    return MOCK_COURSES.find(c => c.slug === slug);
  },

  async getLearningPaths(): Promise<LearningPath[]> {
    if (!isSanityConfigured()) {
      return MOCK_LEARNING_PATHS;
    }
    try {
      const client = await getSanityClient();
      const raw = await client.fetch(QUERIES.learningPaths);
      return raw.map(transformLearningPath);
    } catch (err) {
      console.warn('[CMS] Sanity fetch failed:', err);
      return MOCK_LEARNING_PATHS;
    }
  },
};
