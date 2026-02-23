
-- ============================================================
-- CMS TABLES: courses, modules, lessons
-- ============================================================

-- Courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  thumbnail TEXT NOT NULL DEFAULT '',
  track TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  instructor_name TEXT NOT NULL DEFAULT '',
  instructor_avatar TEXT NOT NULL DEFAULT '',
  instructor_bio TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Modules table
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'content' CHECK (type IN ('content', 'challenge')),
  content TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 20,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Challenge fields (optional)
  challenge_instructions TEXT,
  challenge_starter_code TEXT,
  challenge_expected_output TEXT,
  challenge_language TEXT DEFAULT 'typescript' CHECK (challenge_language IN ('rust', 'typescript', 'json')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Challenge test cases (many per lesson)
CREATE TABLE public.lesson_test_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  input TEXT NOT NULL DEFAULT '',
  expected TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_test_cases ENABLE ROW LEVEL SECURITY;

-- Public can read published courses
CREATE POLICY "Anyone can view published courses"
ON public.courses FOR SELECT
USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view modules of published courses"
ON public.course_modules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_modules.course_id AND courses.published = true
  )
);

CREATE POLICY "Admins can manage modules"
ON public.course_modules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view lessons of published courses"
ON public.lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_modules
    JOIN public.courses ON courses.id = course_modules.course_id
    WHERE course_modules.id = lessons.module_id AND courses.published = true
  )
);

CREATE POLICY "Admins can manage lessons"
ON public.lessons FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view test cases of published lessons"
ON public.lesson_test_cases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lessons
    JOIN public.course_modules ON course_modules.id = lessons.module_id
    JOIN public.courses ON courses.id = course_modules.course_id
    WHERE lessons.id = lesson_test_cases.lesson_id AND courses.published = true
  )
);

CREATE POLICY "Admins can manage test cases"
ON public.lesson_test_cases FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- AUTO UPDATE TIMESTAMPS
-- ============================================================

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
