-- Prevent privilege escalation: user_type must remain whatever was set at signup.
-- The handle_new_user trigger (SECURITY DEFINER, INSERT only) is unaffected.

CREATE OR REPLACE FUNCTION public.prevent_user_type_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    RAISE EXCEPTION 'user_type cannot be changed after signup';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lock_user_type ON public.profiles;

CREATE TRIGGER lock_user_type
  BEFORE UPDATE OF user_type ON public.profiles
  FOR EACH ROW
  WHEN (OLD.user_type IS DISTINCT FROM NEW.user_type)
  EXECUTE FUNCTION public.prevent_user_type_change();
