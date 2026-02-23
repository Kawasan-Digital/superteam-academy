
-- 1. Remove the policy that exposes wallet_address to everyone via profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2. Drop and recreate public_profiles view ensuring wallet_address is excluded
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT
  id,
  user_id,
  display_name,
  username,
  bio,
  avatar_url,
  xp,
  level,
  streak,
  profile_public,
  wallet_connected,
  twitter_username,
  github_username,
  joined_at,
  updated_at
FROM public.profiles
WHERE profile_public = true;

-- 3. Convert own-profile SELECT to permissive so users can still read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Convert other restrictive policies to permissive for proper access
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
