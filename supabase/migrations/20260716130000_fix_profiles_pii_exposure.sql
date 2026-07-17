-- Corrige o furo de exposicao de PII a usuarios autenticados (cenario §5.2.1).
--
-- ANTES: a policy "Authenticated users can view profiles" USING (auth.uid() IS
-- NOT NULL) permitia que QUALQUER usuario autenticado lesse email e phone de
-- TODOS os perfis. Evidencia: docs/tcc/medicoes/evidencias/2026-07-16/rls-furos-ANTES.log.
--
-- DEPOIS: a leitura direta da tabela profiles fica restrita ao proprio registro
-- (policy "Users can view own profile", auth.uid() = id, da migration base). Os
-- dados nao sensiveis de terceiros continuam disponiveis pela view public_profiles
-- (id, full_name, avatar_url, user_type, created_at — sem email/phone), que roda
-- em modo definer e ja e a UNICA via usada pela aplicacao para dados de contraparte
-- (src/integrations/supabase/views.ts). Portanto a restricao nao afeta o app.
--
-- O comentario da migration 20260514100200 ("authenticated users keep full access
-- to profiles (needed by both dashboards)") estava desatualizado: os dashboards
-- consomem public_profiles, nao a tabela diretamente.

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
