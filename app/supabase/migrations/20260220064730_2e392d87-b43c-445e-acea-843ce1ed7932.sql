
-- ============================================================
-- LEARNING PROGRESS TABLES
-- ============================================================

-- Course enrollments
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, course_id)
);

-- Lesson completions
CREATE TABLE public.lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, lesson_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
ON public.enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments"
ON public.enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
ON public.enrollments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own completions"
ON public.lesson_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own completions"
ON public.lesson_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions"
ON public.lesson_completions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- Update enrolledCount automatically when user enrolls
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_enrolled_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.courses SET enrolled_count = enrolled_count + 1 WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_enrollment_created
  AFTER INSERT ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.increment_enrolled_count();

-- Award XP to profile when lesson completed
CREATE OR REPLACE FUNCTION public.award_lesson_xp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE public.profiles 
  SET xp = xp + NEW.xp_earned
  WHERE user_id = NEW.user_id
  RETURNING xp INTO new_xp;
  
  -- Recalculate level (level = floor(sqrt(xp / 100)))
  new_level := FLOOR(SQRT(new_xp::FLOAT / 100));
  UPDATE public.profiles SET level = new_level WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_lesson_completed
  AFTER INSERT ON public.lesson_completions
  FOR EACH ROW EXECUTE FUNCTION public.award_lesson_xp();
