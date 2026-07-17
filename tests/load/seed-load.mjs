// Semeia N servicos ativos para o teste de carga de leitura (§5.2.2). Usa
// service_role (ignora RLS) apenas para preparar o cenario. Idempotente por titulo.
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const FIXTURE_CATEGORY = "00000000-0000-0000-0000-0000000000c1";
const N = Number(process.env.SEED_N ?? 50);

const admin = createClient(URL, SERVICE_ROLE, { auth: { persistSession: false } });

// Garante um provider dono dos servicos.
const email = "load_provider@test.local";
const list = await admin.auth.admin.listUsers();
let provider = list.data.users.find((u) => u.email === email);
if (!provider) {
  const created = await admin.auth.admin.createUser({
    email,
    password: "test-password-123",
    email_confirm: true,
    user_metadata: { full_name: "Load Provider", user_type: "provider" },
  });
  provider = created.data.user;
}

await admin.from("services").delete().eq("provider_id", provider.id);
const rows = Array.from({ length: N }, (_, i) => ({
  provider_id: provider.id,
  category_id: FIXTURE_CATEGORY,
  title: `Servico de carga ${i + 1}`,
  description: "servico ativo para teste de carga de leitura",
  price_min: 50 + i,
  price_type: "fixed",
  is_active: true,
}));
const { error, count } = await admin.from("services").insert(rows).select("id", { count: "exact" });
if (error) {
  console.error("Falha ao semear:", error.message);
  process.exit(1);
}
console.log(`Semeados ${count ?? N} servicos ativos (provider ${provider.id}).`);
