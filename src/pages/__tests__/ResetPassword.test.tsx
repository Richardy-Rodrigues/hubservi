import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { createSupabaseMock, type SupabaseMock } from "@/test/supabaseMock";

const h = vi.hoisted(() => ({ mock: null as unknown as SupabaseMock }));
vi.mock("@/integrations/supabase/client", () => ({
  get supabase() {
    return h.mock;
  },
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: (...a: unknown[]) => toastMock(...a) }));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

import ResetPassword from "../ResetPassword";

const session = { user: { id: "u1" } };

describe("ResetPassword", () => {
  beforeEach(() => {
    toastMock.mockReset();
    navigateMock.mockReset();
    h.mock = createSupabaseMock({ session });
  });

  afterEach(() => {
    window.location.hash = "";
  });

  it("mostra link invalido quando nao ha sessao de recuperacao", async () => {
    h.mock = createSupabaseMock();
    renderWithProviders(<ResetPassword />);
    expect(await screen.findByText(/link inválido ou expirado/i)).toBeInTheDocument();
  });

  it("mostra link invalido quando o retorno traz erro no hash", async () => {
    window.location.hash = "#error=access_denied&error_code=otp_expired";
    renderWithProviders(<ResetPassword />);
    expect(await screen.findByText(/link inválido ou expirado/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/nova senha/i)).not.toBeInTheDocument();
  });

  it("renderiza o formulario quando existe sessao de recuperacao", async () => {
    renderWithProviders(<ResetPassword />);
    expect(await screen.findByLabelText("Nova senha")).toBeInTheDocument();
  });

  it("bloqueia o envio quando a confirmacao nao confere", async () => {
    renderWithProviders(<ResetPassword />);
    fireEvent.change(await screen.findByLabelText("Nova senha"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), {
      target: { value: "654321" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar nova senha/i }));

    expect(await screen.findByText("As senhas não coincidem")).toBeInTheDocument();
    expect(h.mock.auth.updateUser).not.toHaveBeenCalled();
  });

  it("atualiza a senha e leva ao dashboard", async () => {
    renderWithProviders(<ResetPassword />);
    fireEvent.change(await screen.findByLabelText("Nova senha"), { target: { value: "novasenha" } });
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), {
      target: { value: "novasenha" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar nova senha/i }));

    await waitFor(() => expect(h.mock.auth.updateUser).toHaveBeenCalledWith({ password: "novasenha" }));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Senha atualizada!" }),
    );
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("mostra toast destrutivo quando a atualizacao falha", async () => {
    h.mock = createSupabaseMock({ session, authErrors: { updateUser: { message: "token expirado" } } });
    renderWithProviders(<ResetPassword />);
    fireEvent.change(await screen.findByLabelText("Nova senha"), { target: { value: "novasenha" } });
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), {
      target: { value: "novasenha" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar nova senha/i }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive", description: "token expirado" }),
      ),
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
