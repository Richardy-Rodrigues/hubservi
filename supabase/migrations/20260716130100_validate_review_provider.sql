-- Corrige o furo de atribuicao de review a prestador incorreto (cenario §5.2.1).
--
-- ANTES: a policy de INSERT de reviews (20260514100400) so verifica
-- auth.uid() = client_id e a existencia de booking concluido; NAO valida que
-- reviews.provider_id corresponde ao dono real do service. Um cliente podia atribuir
-- a avaliacao a um prestador que nao prestou o servico. Evidencia:
-- docs/tcc/medicoes/evidencias/2026-07-16/rls-furos-ANTES.log.
--
-- DEPOIS: trigger que espelha, para reviews, a validacao ja existente para bookings
-- (validate_booking_provider, 20260514100100) — defesa em profundidade no banco,
-- independente do cliente.

CREATE OR REPLACE FUNCTION public.validate_review_provider()
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
    RAISE EXCEPTION 'review.provider_id (%) must equal service owner (%)',
      NEW.provider_id, svc_provider;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_review_provider_matches_service ON public.reviews;

CREATE TRIGGER ensure_review_provider_matches_service
  BEFORE INSERT OR UPDATE OF service_id, provider_id ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_provider();
