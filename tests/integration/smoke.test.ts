import { describe, it, expect } from "vitest";
import { signInAs, anonClient } from "./helpers/clients";
import { TEST_USERS, PASSWORD, userIds } from "./helpers/users";

// Smoke test da Semana 2: prova que o stack local esta de pe, que o trigger
// handle_new_user criou o profile na criacao do usuario, e que um usuario
// autenticado le o proprio perfil atraves da API (PostgREST + RLS). E a fundacao
// sobre a qual a suite de RLS da Semana 3 sera construida.
describe("smoke — stack local e autenticacao", () => {
  it("cria usuarios-fixture com profile via trigger", () => {
    // userIds foi preenchido pelo globalSetup.
    expect(userIds.provider_a).toBeTruthy();
    expect(userIds.client_a).toBeTruthy();
  });

  it("usuario autenticado le o proprio perfil", async () => {
    const client = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { data, error } = await client
      .from("profiles")
      .select("id, email, full_name, user_type")
      .eq("id", userIds.client_a)
      .single();

    expect(error).toBeNull();
    expect(data?.email).toBe(TEST_USERS.client_a.email);
    expect(data?.user_type).toBe("client");
  });

  it("provider nasce com user_type='provider' (trigger le user_metadata)", async () => {
    const client = await signInAs(TEST_USERS.provider_a.email, PASSWORD);
    const { data, error } = await client
      .from("profiles")
      .select("user_type")
      .eq("id", userIds.provider_a)
      .single();

    expect(error).toBeNull();
    expect(data?.user_type).toBe("provider");
  });

  it("cliente anonimo nao autentica sessao", async () => {
    const { data } = await anonClient().auth.getSession();
    expect(data.session).toBeNull();
  });
});
