import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSupabaseMock, type SupabaseMock } from "@/test/supabaseMock";

const h = vi.hoisted(() => ({ mock: null as unknown as SupabaseMock }));
vi.mock("@/integrations/supabase/client", () => ({
  get supabase() {
    return h.mock;
  },
}));

import { fetchPublicProfilesByIds, fetchPublicProfileById } from "../views";

const profiles = [
  { id: "p1", full_name: "Prestador Um", avatar_url: "a1" },
  { id: "p2", full_name: "Prestador Dois", avatar_url: "a2" },
  { id: "p3", full_name: "Prestador Tres", avatar_url: "a3" },
];

describe("views — public_profiles", () => {
  beforeEach(() => {
    h.mock = createSupabaseMock({ tables: { public_profiles: profiles } });
  });

  it("fetchPublicProfilesByIds retorna vazio sem consultar quando ids e vazio", async () => {
    const r = await fetchPublicProfilesByIds([]);
    expect(r).toEqual([]);
  });

  it("fetchPublicProfilesByIds filtra pelos ids informados", async () => {
    const r = await fetchPublicProfilesByIds(["p1", "p3"]);
    expect(r.map((x) => x.id).sort()).toEqual(["p1", "p3"]);
  });

  it("fetchPublicProfileById retorna o perfil correspondente", async () => {
    const r = await fetchPublicProfileById("p2");
    expect(r?.full_name).toBe("Prestador Dois");
  });

  it("fetchPublicProfileById retorna null quando nao encontra", async () => {
    const r = await fetchPublicProfileById("inexistente");
    expect(r).toBeNull();
  });
});
