
-- Fix enrollments policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can create own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;

CREATE POLICY "Users can create own enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Also fix profiles policies (same issue)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable"
  ON public.profiles FOR SELECT
  USING (profile_public = true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Fix lesson_completions policies
DROP POLICY IF EXISTS "Users can create own completions" ON public.lesson_completions;
DROP POLICY IF EXISTS "Users can view own completions" ON public.lesson_completions;
DROP POLICY IF EXISTS "Admins can view all completions" ON public.lesson_completions;

CREATE POLICY "Users can create own completions"
  ON public.lesson_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own completions"
  ON public.lesson_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions"
  ON public.lesson_completions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix courses policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;

CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix course_modules policies
DROP POLICY IF EXISTS "Anyone can view modules of published courses" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.course_modules;

CREATE POLICY "Anyone can view modules of published courses"
  ON public.course_modules FOR SELECT
  USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_modules.course_id AND courses.published = true));

CREATE POLICY "Admins can manage modules"
  ON public.course_modules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix lessons policies
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;

CREATE POLICY "Anyone can view lessons of published courses"
  ON public.lessons FOR SELECT
  USING (EXISTS (SELECT 1 FROM course_modules JOIN courses ON courses.id = course_modules.course_id WHERE course_modules.id = lessons.module_id AND courses.published = true));

CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix lesson_test_cases policies
DROP POLICY IF EXISTS "Anyone can view test cases of published lessons" ON public.lesson_test_cases;
DROP POLICY IF EXISTS "Admins can manage test cases" ON public.lesson_test_cases;

CREATE POLICY "Anyone can view test cases of published lessons"
  ON public.lesson_test_cases FOR SELECT
  USING (EXISTS (SELECT 1 FROM lessons JOIN course_modules ON course_modules.id = lessons.module_id JOIN courses ON courses.id = course_modules.course_id WHERE lessons.id = lesson_test_cases.lesson_id AND courses.published = true));

CREATE POLICY "Admins can manage test cases"
  ON public.lesson_test_cases FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
