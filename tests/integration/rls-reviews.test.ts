import { describe, it, expect, beforeEach } from "vitest";
import { signInAs } from "./helpers/clients";
import { createService, createBooking, resetDomainData } from "./helpers/data";
import { TEST_USERS, PASSWORD, userIds } from "./helpers/users";

// Cenarios de seguranca §5.2.1 — criacao de reviews. Dois controles ja cobertos
// por policy + um FURO CONHECIDO.
//
// FURO CONHECIDO (deve reprovar hoje): a policy de INSERT de reviews so verifica
// auth.uid() = client_id e a existencia de booking concluido; NAO valida que
// reviews.provider_id corresponde ao dono real do service. Bookings tem o trigger
// validate_booking_provider; reviews nao tem equivalente. Um cliente pode, assim,
// atribuir uma avaliacao a um prestador que nao prestou o servico.

describe("RLS — criacao de reviews", () => {
  beforeEach(async () => {
    await resetDomainData();
  });

  it("cliente com booking concluido cria review com provider correto (controle)", async () => {
    const serviceId = await createService(userIds.provider_a);
    await createBooking(serviceId, userIds.client_a, userIds.provider_a, "completed");

    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { error } = await clientA.from("reviews").insert({
      service_id: serviceId,
      client_id: userIds.client_a,
      provider_id: userIds.provider_a,
      rating: 5,
      comment: "Otimo servico",
    });

    expect(error).toBeNull();
  });

  it("cliente SEM booking concluido nao cria review (controle)", async () => {
    const serviceId = await createService(userIds.provider_a);
    // booking pendente, nao concluido
    await createBooking(serviceId, userIds.client_a, userIds.provider_a, "pending");

    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { error } = await clientA.from("reviews").insert({
      service_id: serviceId,
      client_id: userIds.client_a,
      provider_id: userIds.provider_a,
      rating: 5,
      comment: "Sem booking concluido",
    });

    // Policy exige booking concluido: insert deve ser rejeitado.
    expect(error).not.toBeNull();
  });

  it("cliente NAO deve avaliar um prestador que nao e o dono do servico", async () => {
    const serviceId = await createService(userIds.provider_a);
    await createBooking(serviceId, userIds.client_a, userIds.provider_a, "completed");

    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { error } = await clientA.from("reviews").insert({
      service_id: serviceId,
      client_id: userIds.client_a,
      // provider_id FALSO: provider_b nao e o dono do service.
      provider_id: userIds.provider_b,
      rating: 1,
      comment: "Avaliacao atribuida ao prestador errado",
    });

    // Seguro: deve ser rejeitado. Enquanto o furo existir, o insert e aceito e
    // esta asercao falha (evidencia do furo).
    expect(error).not.toBeNull();
  });
});
