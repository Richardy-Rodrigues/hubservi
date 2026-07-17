import { describe, it, expect } from "vitest";
import { signInAs } from "./helpers/clients";
import { serviceClient } from "./helpers/clients";
import { TEST_USERS, PASSWORD, userIds } from "./helpers/users";

// Cenario de seguranca §5.2.1 — escalonamento de privilegio: usuario tenta alterar
// o proprio user_type (client -> provider). Criterio: 100% bloqueadas.
// Protegido pelo trigger lock_user_type (20260514100000). Deve PASSAR hoje.

describe("RLS/trigger — imutabilidade de user_type", () => {
  it("cliente NAO consegue escalar o proprio user_type para provider", async () => {
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { error } = await clientA
      .from("profiles")
      .update({ user_type: "provider" })
      .eq("id", userIds.client_a);

    // Trigger lock_user_type levanta excecao na tentativa de mudanca.
    expect(error).not.toBeNull();

    // Confirma que permaneceu 'client' (leitura via service_role, sem RLS).
    const { data } = await serviceClient()
      .from("profiles")
      .select("user_type")
      .eq("id", userIds.client_a)
      .single();
    expect(data?.user_type).toBe("client");
  });

  it("cliente atualiza o proprio nome normalmente (controle)", async () => {
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { error } = await clientA
      .from("profiles")
      .update({ full_name: "Cliente A Renomeado" })
      .eq("id", userIds.client_a);
    expect(error).toBeNull();
  });

  it("cliente NAO altera o perfil de outro usuario (controle de isolamento)", async () => {
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { data } = await clientA
      .from("profiles")
      .update({ full_name: "invadido" })
      .eq("id", userIds.provider_b)
      .select();

    // RLS (auth.uid() = id) impede: nenhuma linha de outro usuario e afetada.
    expect(data ?? []).toHaveLength(0);
  });
});
