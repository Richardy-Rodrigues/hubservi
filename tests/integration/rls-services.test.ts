import { describe, it, expect, beforeEach } from "vitest";
import { signInAs, anonClient } from "./helpers/clients";
import { createService, resetDomainData } from "./helpers/data";
import { FIXTURE_CATEGORY_ID } from "./helpers/env";
import { TEST_USERS, PASSWORD, userIds } from "./helpers/users";

// Cenarios de seguranca §5.2.1 — isolamento de servicos por prestador.
// Policies: qualquer um ve ativos; prestador ve/insere/edita/remove os proprios
// (auth.uid() = provider_id). Devem PASSAR hoje.

describe("RLS — servicos", () => {
  beforeEach(async () => {
    await resetDomainData();
  });

  it("prestador cria o proprio servico (controle)", async () => {
    const providerA = await signInAs(TEST_USERS.provider_a.email, PASSWORD);
    const { error } = await providerA.from("services").insert({
      provider_id: userIds.provider_a,
      category_id: FIXTURE_CATEGORY_ID,
      title: "Servico do A",
      description: "descricao valida",
      price_min: 100,
      price_type: "fixed",
      is_active: true,
    });
    expect(error).toBeNull();
  });

  it("prestador NAO cria servico em nome de outro prestador", async () => {
    const providerA = await signInAs(TEST_USERS.provider_a.email, PASSWORD);
    const { error } = await providerA.from("services").insert({
      // provider_id de outro: WITH CHECK (auth.uid() = provider_id) barra.
      provider_id: userIds.provider_b,
      category_id: FIXTURE_CATEGORY_ID,
      title: "Servico forjado",
      description: "descricao valida",
      price_min: 100,
      price_type: "fixed",
      is_active: true,
    });
    expect(error).not.toBeNull();
  });

  it("prestador NAO edita servico de outro prestador", async () => {
    const serviceId = await createService(userIds.provider_a, { title: "Original" });
    const providerB = await signInAs(TEST_USERS.provider_b.email, PASSWORD);
    const { data } = await providerB
      .from("services")
      .update({ title: "Sequestrado" })
      .eq("id", serviceId)
      .select();
    expect(data ?? []).toHaveLength(0);
  });

  it("anonimo ve servico ativo, mas nao inativo", async () => {
    const ativo = await createService(userIds.provider_a, { is_active: true });
    const inativo = await createService(userIds.provider_a, { is_active: false });
    const anon = anonClient();

    const { data: verAtivo } = await anon.from("services").select("id").eq("id", ativo).maybeSingle();
    expect(verAtivo?.id).toBe(ativo);

    const { data: verInativo } = await anon.from("services").select("id").eq("id", inativo).maybeSingle();
    expect(verInativo).toBeNull();
  });

  it("prestador ve o proprio servico inativo (controle)", async () => {
    const inativo = await createService(userIds.provider_a, { is_active: false });
    const providerA = await signInAs(TEST_USERS.provider_a.email, PASSWORD);
    const { data } = await providerA.from("services").select("id").eq("id", inativo).maybeSingle();
    expect(data?.id).toBe(inativo);
  });
});
