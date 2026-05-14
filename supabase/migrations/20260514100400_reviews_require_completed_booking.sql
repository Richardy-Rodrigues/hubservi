-- Only clients with a completed booking on the same service may post a review.
-- Replaces the original policy that accepted any authenticated client.

DROP POLICY IF EXISTS "Clients can create reviews" ON public.reviews;

CREATE POLICY "Clients can create reviews after completed booking"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1
      FROM public.bookings b
      WHERE b.service_id = reviews.service_id
        AND b.client_id = auth.uid()
        AND b.status = 'completed'
    )
  );
