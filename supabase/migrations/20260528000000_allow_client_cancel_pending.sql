-- Allow clients to cancel their own pending bookings.
-- Until now, only providers could update booking status (accept/reject/complete/cancel).
-- Clients had no way to withdraw a pending request, even when the provider had not
-- responded yet. This migration:
--   1. Extends the booking_status transition validator to accept pending -> cancelled.
--   2. Adds an UPDATE policy that lets the client update their own booking row,
--      but only when current status is 'pending' and the new status is 'cancelled'.

CREATE OR REPLACE FUNCTION public.validate_booking_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW;
  ELSIF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected', 'cancelled') THEN RETURN NEW;
  ELSIF OLD.status = 'accepted' AND NEW.status IN ('completed', 'cancelled') THEN RETURN NEW;
  ELSE RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$;

DROP POLICY IF EXISTS "Clients can cancel own pending bookings" ON public.bookings;
CREATE POLICY "Clients can cancel own pending bookings"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid() = client_id AND status = 'pending')
  WITH CHECK (auth.uid() = client_id AND status = 'cancelled');
