
-- Create a secure view that excludes wallet_address from public profiles
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id, user_id, display_name, username, bio, avatar_url,
  github_username, twitter_username, xp, level, streak,
  profile_public, joined_at, updated_at,
  wallet_connected
FROM public.profiles
WHERE profile_public = true;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;
