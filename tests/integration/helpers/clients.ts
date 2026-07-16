import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY } from "./env";

// NAO reutilizamos src/integrations/supabase/client.ts: aquele singleton depende de
// import.meta.env e de localStorage (browser), inexistentes em Node. Aqui cada
// cliente e criado sem persistencia de sessao, isolado por teste.

const noPersist = {
  auth: { persistSession: false, autoRefreshToken: false },
} as const;

// Cliente anonimo (papel `anon`): representa um visitante nao autenticado.
export function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, noPersist);
}

// Cliente com service_role: ignora RLS. Uso EXCLUSIVO de setup/teardown (criar
// usuarios, semear e limpar dados). Nunca e o sujeito de um cenario de seguranca.
export function serviceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, noPersist);
}

// Cliente autenticado como um usuario especifico. Faz sign-in com senha e retorna
// um cliente cujas requisicoes carregam o JWT daquele usuario — e assim que os
// testes exercitam RLS "como" cada papel, contra a API real (PostgREST).
export async function signInAs(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, ANON_KEY, noPersist);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Falha ao autenticar ${email}: ${error.message}`);
  return client;
}
