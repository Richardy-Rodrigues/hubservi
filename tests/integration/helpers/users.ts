import { serviceClient } from "./clients";

// Usuarios-fixture. Os pares A/B existem para os cenarios cross-tenant (um usuario
// tentando acessar dados de outro). Senha comum a todos — ambiente de teste local.
export const PASSWORD = "test-password-123";

export const TEST_USERS = {
  provider_a: { email: "provider_a@test.local", full_name: "Provider A", user_type: "provider" as const },
  provider_b: { email: "provider_b@test.local", full_name: "Provider B", user_type: "provider" as const },
  client_a: { email: "client_a@test.local", full_name: "Client A", user_type: "client" as const },
  client_b: { email: "client_b@test.local", full_name: "Client B", user_type: "client" as const },
};

export type TestUserKey = keyof typeof TEST_USERS;

// Mapa preenchido no globalSetup: chave -> id (uuid) do usuario criado.
export const userIds: Record<string, string> = {};

// Cria os usuarios-fixture via admin API (service_role). email_confirm=true evita a
// etapa de confirmacao. O user_type vai em user_metadata: o trigger handle_new_user
// le raw_user_meta_data->>'user_type' para popular profiles.user_type — e a unica
// forma de nascer um provider (a migration 20260316201000 confirma esse caminho).
export async function createTestUsers(): Promise<void> {
  const admin = serviceClient();

  for (const [key, u] of Object.entries(TEST_USERS)) {
    // Idempotencia: se ja existe (reset parcial), reaproveita o id.
    const { data: existing } = await admin.auth.admin.listUsers();
    const found = existing?.users.find((x) => x.email === u.email);
    if (found) {
      userIds[key] = found.id;
      continue;
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, user_type: u.user_type },
    });
    if (error) throw new Error(`Falha ao criar usuario ${key}: ${error.message}`);
    userIds[key] = data.user.id;
  }
}
