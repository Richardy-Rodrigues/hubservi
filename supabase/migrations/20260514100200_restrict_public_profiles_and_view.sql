-- Stop exposing PII (email, phone) via public profile SELECT.
-- Anonymous traffic now reads non-sensitive columns via the public_profiles view;
-- authenticated users keep full access to profiles (needed by both dashboards).

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  user_type,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
