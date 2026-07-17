import { describe, it, expect, beforeEach } from "vitest";
import { signInAs, anonClient } from "./helpers/clients";
import { resetDomainData } from "./helpers/data";
import { TEST_USERS, PASSWORD, userIds } from "./helpers/users";

// Cenario de seguranca §5.2.1 — Exposicao de PII (email, phone) a usuario anonimo
// E a usuario autenticado nao relacionado. Criterio: 0 campos expostos.
//
// FURO CONHECIDO (deve reprovar hoje): a policy "Authenticated users can view
// profiles" USING (auth.uid() IS NOT NULL) permite que QUALQUER autenticado leia
// email/phone de TODOS os perfis. Os testes abaixo expressam o comportamento
// seguro; espera-se que o segundo FALHE ate a correcao por migration.

describe("RLS — exposicao de PII em profiles", () => {
  beforeEach(async () => {
    await resetDomainData();
  });

  it("anonimo nao le a tabela profiles diretamente (controle)", async () => {
    const { data } = await anonClient()
      .from("profiles")
      .select("id, email, phone");
    // Sem policy para anon: RLS retorna conjunto vazio.
    expect(data ?? []).toHaveLength(0);
  });

  it("autenticado NAO deve ler email/phone de outro usuario", async () => {
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { data } = await clientA
      .from("profiles")
      .select("email, phone")
      .eq("id", userIds.provider_b)
      .maybeSingle();

    // Seguro: nenhum dado de outro perfil deve retornar. Enquanto o furo existir,
    // `data` traz o email/phone de provider_b e esta asercao falha (evidencia).
    expect(data).toBeNull();
  });

  it("autenticado le o proprio perfil normalmente (controle)", async () => {
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { data, error } = await clientA
      .from("profiles")
      .select("email")
      .eq("id", userIds.client_a)
      .single();

    expect(error).toBeNull();
    expect(data?.email).toBe(TEST_USERS.client_a.email);
  });

  it("view public_profiles nao expoe email nem phone (controle)", async () => {
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { data, error } = await clientA
      .from("public_profiles")
      .select("*")
      .eq("id", userIds.provider_b)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    // A view expoe apenas colunas nao sensiveis.
    expect(data).not.toHaveProperty("email");
    expect(data).not.toHaveProperty("phone");
  });
});
