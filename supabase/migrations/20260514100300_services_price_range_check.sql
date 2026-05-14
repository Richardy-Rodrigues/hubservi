-- Enforce price range coherence at the database level.
-- NOT VALID + VALIDATE keeps the table available during deployment and surfaces
-- any preexisting bad rows rather than failing the migration silently.

ALTER TABLE public.services
  ADD CONSTRAINT services_price_range_check
  CHECK (price_max IS NULL OR price_max >= price_min)
  NOT VALID;

ALTER TABLE public.services
  VALIDATE CONSTRAINT services_price_range_check;
