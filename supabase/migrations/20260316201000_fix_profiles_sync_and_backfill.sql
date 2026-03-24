-- Keep profiles in sync with auth.users for projects migrated manually.

-- Allow authenticated users to insert their own profile when needed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
END;
$$;

-- Ensure signup trigger function is idempotent and does not fail on duplicates.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'user_type' IN ('client', 'provider')
        THEN (NEW.raw_user_meta_data->>'user_type')::public.user_type
      ELSE 'client'::public.user_type
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE
      WHEN COALESCE(public.profiles.full_name, '') = '' THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    user_type = public.profiles.user_type,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Recreate trigger to guarantee it is attached to auth.users.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill missing profiles for users already created in auth.users.
INSERT INTO public.profiles (id, email, full_name, user_type)
SELECT
  u.id,
  u.email,
  COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), ''),
  CASE
    WHEN u.raw_user_meta_data->>'user_type' IN ('client', 'provider')
      THEN (u.raw_user_meta_data->>'user_type')::public.user_type
    ELSE 'client'::public.user_type
  END
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;