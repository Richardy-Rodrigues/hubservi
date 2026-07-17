import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { createSupabaseMock, type SupabaseMock } from "@/test/supabaseMock";

const h = vi.hoisted(() => ({ mock: null as unknown as SupabaseMock }));
vi.mock("@/integrations/supabase/client", () => ({
  get supabase() {
    return h.mock;
  },
}));

import { AuthProvider, useAuth } from "../AuthContext";

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const profileRow = { id: "u1", email: "u1@test.com", full_name: "User Um", user_type: "client" };

describe("AuthContext", () => {
  beforeEach(() => {
    h.mock = createSupabaseMock({ tables: { profiles: [profileRow] } });
  });

  it("sem sessao: encerra loading, sem user nem profile", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it("com sessao: carrega o profile do usuario autenticado", async () => {
    h.mock = createSupabaseMock({
      tables: { profiles: [profileRow] },
      session: { user: { id: "u1" } },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.profile).not.toBeNull());
    expect(result.current.user?.id).toBe("u1");
    expect(result.current.profile?.email).toBe("u1@test.com");
    expect(result.current.profile?.user_type).toBe("client");
  });

  it("signOut limpa sessao e profile", async () => {
    h.mock = createSupabaseMock({
      tables: { profiles: [profileRow] },
      session: { user: { id: "u1" } },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.profile).not.toBeNull());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });
});
