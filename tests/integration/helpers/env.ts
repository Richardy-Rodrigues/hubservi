// Endpoints e chaves do stack Supabase LOCAL. Sao as chaves publicas fixas que a
// CLI usa em todo ambiente local (identicas em qualquer maquina) — nao ha segredo
// de producao aqui. Podem ser sobrescritas por variaveis de ambiente para apontar
// a suite a um projeto de teste remoto (fallback do risco R2 no plano).
export const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";

export const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// UUID fixo da categoria de fixtures (ver supabase/seed.sql).
export const FIXTURE_CATEGORY_ID = "00000000-0000-0000-0000-0000000000c1";
