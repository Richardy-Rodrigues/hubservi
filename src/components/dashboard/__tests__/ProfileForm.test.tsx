import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { createSupabaseMock, type SupabaseMock } from "@/test/supabaseMock";

const h = vi.hoisted(() => ({ mock: null as unknown as SupabaseMock }));
vi.mock("@/integrations/supabase/client", () => ({
  get supabase() {
    return h.mock;
  },
}));

const refreshProfile = vi.fn();
const useAuthMock = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => useAuthMock() }));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: (...a: unknown[]) => toastMock(...a) }));

import { ProfileForm } from "../ProfileForm";

const profile = { id: "u1", full_name: "Nome Atual", phone: "", avatar_url: "" };

function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: /editar perfil/i }));
}

describe("ProfileForm", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    toastMock.mockReset();
    refreshProfile.mockReset();
    useAuthMock.mockReturnValue({ user: { id: "u1" }, profile, refreshProfile });
    h.mock = createSupabaseMock({ tables: { profiles: [{ ...profile }] } });
  });

  it("abre o dialogo com os dados atuais do perfil", async () => {
    renderWithProviders(<ProfileForm />);
    openDialog();
    const nome = await screen.findByLabelText(/nome completo/i);
    expect((nome as HTMLInputElement).value).toBe("Nome Atual");
  });

  it("bloqueia salvar com nome vazio", async () => {
    renderWithProviders(<ProfileForm />);
    openDialog();
    const nome = await screen.findByLabelText(/nome completo/i);
    fireEvent.change(nome, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /^salvar$/i }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })),
    );
    expect(refreshProfile).not.toHaveBeenCalled();
  });

  it("salva as alteracoes e atualiza o perfil", async () => {
    renderWithProviders(<ProfileForm />);
    openDialog();
    const nome = await screen.findByLabelText(/nome completo/i);
    fireEvent.change(nome, { target: { value: "Nome Novo" } });
    fireEvent.click(screen.getByRole("button", { name: /^salvar$/i }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: "Perfil atualizado!" })),
    );
    expect(refreshProfile).toHaveBeenCalled();
    expect(h.mock.__store.profiles[0].full_name).toBe("Nome Novo");
  });
});
