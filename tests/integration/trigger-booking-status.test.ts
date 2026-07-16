import { describe, it, expect, beforeEach } from "vitest";
import { serviceClient } from "./helpers/clients";
import { createService, createBooking, resetDomainData } from "./helpers/data";
import { userIds } from "./helpers/users";

// Cenario de confiabilidade §5.2.5 — consistencia da maquina de estados do booking.
// Criterio: 0 transicoes invalidas aceitas. Protegido por
// validate_booking_status_transition. Testado via service_role para isolar o
// trigger (regra de negocio no banco) da autorizacao (RLS). Deve PASSAR hoje.
//
// Transicoes validas: pending -> {accepted, rejected, cancelled};
//                     accepted -> {completed, cancelled}.

describe("trigger — transicoes de status do booking", () => {
  const admin = serviceClient();

  beforeEach(async () => {
    await resetDomainData();
  });

  async function newPendingBooking(): Promise<string> {
    const serviceId = await createService(userIds.provider_a);
    return createBooking(serviceId, userIds.client_a, userIds.provider_a, "pending");
  }

  it("aceita transicao valida pending -> accepted -> completed", async () => {
    const id = await newPendingBooking();
    const r1 = await admin.from("bookings").update({ status: "accepted" }).eq("id", id);
    expect(r1.error).toBeNull();
    const r2 = await admin.from("bookings").update({ status: "completed" }).eq("id", id);
    expect(r2.error).toBeNull();
  });

  it("rejeita transicao invalida pending -> completed", async () => {
    const id = await newPendingBooking();
    const { error } = await admin.from("bookings").update({ status: "completed" }).eq("id", id);
    expect(error).not.toBeNull();
  });

  it("rejeita transicao invalida a partir de estado terminal (rejected -> accepted)", async () => {
    const id = await newPendingBooking();
    await admin.from("bookings").update({ status: "rejected" }).eq("id", id);
    const { error } = await admin.from("bookings").update({ status: "accepted" }).eq("id", id);
    expect(error).not.toBeNull();
  });
});
