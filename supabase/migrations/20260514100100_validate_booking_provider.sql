-- Defense-in-depth: ensure booking.provider_id always matches the service owner.
-- RLS already enforces auth.uid() = client_id on INSERT, but does not cross-check
-- that the provider_id sent by the client points to the real owner of service_id.

CREATE OR REPLACE FUNCTION public.validate_booking_provider()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  svc_provider UUID;
BEGIN
  SELECT provider_id INTO svc_provider
  FROM public.services
  WHERE id = NEW.service_id;

  IF svc_provider IS NULL THEN
    RAISE EXCEPTION 'service % not found', NEW.service_id;
  END IF;

  IF NEW.provider_id IS DISTINCT FROM svc_provider THEN
    RAISE EXCEPTION 'booking.provider_id (%) must equal service owner (%)',
      NEW.provider_id, svc_provider;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_booking_provider_matches_service ON public.bookings;

CREATE TRIGGER ensure_booking_provider_matches_service
  BEFORE INSERT OR UPDATE OF service_id, provider_id ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_provider();
