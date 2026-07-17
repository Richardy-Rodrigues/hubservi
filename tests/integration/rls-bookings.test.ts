import { describe, it, expect, beforeEach } from "vitest";
import { signInAs } from "./helpers/clients";
import { createService, createBooking, resetDomainData } from "./helpers/data";
import { TEST_USERS, PASSWORD, userIds } from "./helpers/users";

// Cenarios de seguranca §5.2.1 — isolamento de bookings + cancelamento restrito.
// Policies: cliente/prestador veem os proprios; cliente cria os proprios; prestador
// atualiza status; cliente cancela o proprio pendente (pending -> cancelled).
// Devem PASSAR hoje.

describe("RLS — bookings", () => {
  beforeEach(async () => {
    await resetDomainData();
  });

  it("cliente cria booking proprio para um servico (controle)", async () => {
    const serviceId = await createService(userIds.provider_a);
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { error } = await clientA.from("bookings").insert({
      service_id: serviceId,
      client_id: userIds.client_a,
      provider_id: userIds.provider_a,
      status: "pending",
    });
    expect(error).toBeNull();
  });

  it("cliente NAO cria booking em nome de outro cliente", async () => {
    const serviceId = await createService(userIds.provider_a);
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { error } = await clientA.from("bookings").insert({
      service_id: serviceId,
      client_id: userIds.client_b, // WITH CHECK (auth.uid() = client_id) barra
      provider_id: userIds.provider_a,
      status: "pending",
    });
    expect(error).not.toBeNull();
  });

  it("cliente nao relacionado NAO enxerga booking de outro cliente", async () => {
    const serviceId = await createService(userIds.provider_a);
    const bookingId = await createBooking(serviceId, userIds.client_a, userIds.provider_a, "pending");
    const clientB = await signInAs(TEST_USERS.client_b.email, PASSWORD);
    const { data } = await clientB.from("bookings").select("id").eq("id", bookingId).maybeSingle();
    expect(data).toBeNull();
  });

  it("cliente cancela o proprio booking pendente (controle)", async () => {
    const serviceId = await createService(userIds.provider_a);
    const bookingId = await createBooking(serviceId, userIds.client_a, userIds.provider_a, "pending");
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { error } = await clientA.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    expect(error).toBeNull();
  });

  it("cliente NAO aceita o proprio booking (so o prestador aceita)", async () => {
    const serviceId = await createService(userIds.provider_a);
    const bookingId = await createBooking(serviceId, userIds.client_a, userIds.provider_a, "pending");
    const clientA = await signInAs(TEST_USERS.client_a.email, PASSWORD);
    const { data } = await clientA
      .from("bookings")
      .update({ status: "accepted" })
      .eq("id", bookingId)
      .select();
    // Policy do cliente so admite -> cancelled; a de aceitar exige ser o prestador.
    expect(data ?? []).toHaveLength(0);
  });

  it("prestador aceita booking pendente do proprio servico (controle)", async () => {
    const serviceId = await createService(userIds.provider_a);
    const bookingId = await createBooking(serviceId, userIds.client_a, userIds.provider_a, "pending");
    const providerA = await signInAs(TEST_USERS.provider_a.email, PASSWORD);
    const { error } = await providerA.from("bookings").update({ status: "accepted" }).eq("id", bookingId);
    expect(error).toBeNull();
  });
});
