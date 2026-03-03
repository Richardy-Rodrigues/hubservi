
DROP VIEW IF EXISTS public.service_stats;
CREATE OR REPLACE VIEW public.service_stats WITH (security_invoker = true) AS
SELECT
  s.id AS service_id,
  COUNT(r.id)::INTEGER AS review_count,
  COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) AS average_rating
FROM public.services s
LEFT JOIN public.reviews r ON r.service_id = s.id
GROUP BY s.id;
