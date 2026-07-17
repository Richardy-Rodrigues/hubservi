import { describe, it, expect, beforeEach } from "vitest";
import { serviceClient } from "./helpers/clients";
import { createService, createBooking, resetDomainData } from "./helpers/data";
import { userIds } from "./helpers/users";

// Cenario de confiabilidade §5.2.5 — integridade referencial em exclusoes em
// cascata. Criterio: 0 registros orfaos apos exclusao. bookings e reviews tem
// FK ON DELETE CASCADE para services. Deve PASSAR hoje.

describe("integridade — exclusao em cascata de service", () => {
  const admin = serviceClient();

  beforeEach(async () => {
    await resetDomainData();
  });

  it("remover um service remove seus bookings e reviews (0 orfaos)", async () => {
    const serviceId = await createService(userIds.provider_a);
    await createBooking(serviceId, userIds.client_a, userIds.provider_a, "completed");
    await admin.from("reviews").insert({
      service_id: serviceId,
      client_id: userIds.client_a,
      provider_id: userIds.provider_a,
      rating: 5,
      comment: "ok",
    });

    // Sanidade: existem antes da exclusao.
    const antesB = await admin.from("bookings").select("id").eq("service_id", serviceId);
    const antesR = await admin.from("reviews").select("id").eq("service_id", serviceId);
    expect(antesB.data ?? []).toHaveLength(1);
    expect(antesR.data ?? []).toHaveLength(1);

    // Exclui o service.
    const del = await admin.from("services").delete().eq("id", serviceId);
    expect(del.error).toBeNull();

    // Nenhum orfao referenciando o service excluido.
    const depoisB = await admin.from("bookings").select("id").eq("service_id", serviceId);
    const depoisR = await admin.from("reviews").select("id").eq("service_id", serviceId);
    expect(depoisB.data ?? []).toHaveLength(0);
    expect(depoisR.data ?? []).toHaveLength(0);
  });
});
