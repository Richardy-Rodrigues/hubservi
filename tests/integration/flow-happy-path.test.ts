import { describe, it, expect, beforeEach } from "vitest";
import { signInAs } from "./helpers/clients";
import { resetDomainData } from "./helpers/data";
import { FIXTURE_CATEGORY_ID } from "./helpers/env";
import { TEST_USERS, PASSWORD, userIds } from "./helpers/users";

// Cenario de confiabilidade §5.2.5 — fluxo critico ponta a ponta (auth -> service
// -> booking -> review), cada passo pelo papel correto e atraves da API real.
// Criterio: 100% de sucesso nos casos validos. Deve PASSAR hoje.

describe("fluxo feliz — ciclo completo de contratacao e avaliacao", () => {
  beforeEach(async () => {
    await resetDomainData();
  });

  it("prestador publica servico, cliente contrata, prestador conclui, cliente avalia", async () => {
    // 1. Prestador publica um servico.
    const providerA = await signInAs(TEST_USERS.provider_a.email, PASSWORD);
    const { data: svc, error: svcErr } = await providerA
      .from("services")
      .insert({
        provider_id: userIds.provider_a,
        category_id: FIXTURE_CATEGORY_ID,
        title: "Instalacao eletrica",
        description: "servico completo de instalacao",
        price_min: 250,
        price_type: "fixed",
        is_active: true,
      })
      .select("id")
      .single();
    expect(svcErr).toBeNull();
    const serviceId = svc!.id;

    // 2. Cliente contrata (booking pendente).
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { data: bk, error: bkErr } = await clientA
      .from("bookings")
      .insert({
        service_id: serviceId,
        client_id: userIds.client_a,
        provider_id: userIds.provider_a,
        status: "pending",
      })
      .select("id")
      .single();
    expect(bkErr).toBeNull();
    const bookingId = bk!.id;

    // 3. Prestador aceita e conclui.
    const acc = await providerA.from("bookings").update({ status: "accepted" }).eq("id", bookingId);
    expect(acc.error).toBeNull();
    const done = await providerA.from("bookings").update({ status: "completed" }).eq("id", bookingId);
    expect(done.error).toBeNull();

    // 4. Cliente avalia (com provider correto e booking concluido).
    const rev = await clientA.from("reviews").insert({
      service_id: serviceId,
      client_id: userIds.client_a,
      provider_id: userIds.provider_a,
      rating: 5,
      comment: "Excelente, recomendo",
    });
    expect(rev.error).toBeNull();

    // 5. A avaliacao aparece nas estatisticas do servico (view service_stats).
    const { data: stats } = await clientA
      .from("service_stats")
      .select("review_count, average_rating")
      .eq("service_id", serviceId)
      .single();
    expect(Number(stats?.review_count)).toBe(1);
    expect(Number(stats?.average_rating)).toBe(5);
  });
});
