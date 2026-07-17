-- Reproduz os privilegios de API que o Supabase concede, em producao, aos papeis
-- anon / authenticated / service_role sobre o schema public.
--
-- MOTIVO (achado de reprodutibilidade — Semana 2 do TCC): imagens recentes do
-- Postgres do Supabase deixaram de conceder DML (SELECT/INSERT/UPDATE/DELETE) por
-- padrao ao schema public. As default privileges do public passaram a conceder
-- apenas TRUNCATE/REFERENCES/TRIGGER a esses papeis (verificavel com \ddp), ao
-- contrario do schema storage, que mantem arwdDxt completo. O historico de
-- migrations nao continha estes GRANTs — dependia de um estado presente apenas na
-- instancia de producao (provavelmente aplicado manualmente; cf. commit ad89e6c
-- "necessarios migrations manuais no supabase"). Ao reproduzir o banco do zero num
-- ambiente limpo, o PostgREST retornava 42501 (permission denied) ANTES mesmo de o
-- RLS ser avaliado.
--
-- Esta migration torna o historico auto-suficiente. Importante para a avaliacao:
-- o GRANT e a porta GROSSA (papel pode tocar a tabela); o RLS e a porta FINA (quais
-- linhas). Conceder DML amplo a anon/authenticated e o modelo padrao do Supabase —
-- e o RLS que restringe. Nenhuma policy de RLS e alterada aqui: os controles de
-- seguranca existentes permanecem exatamente como estao.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Tabelas/sequencias criadas dali em diante herdam os mesmos privilegios.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
