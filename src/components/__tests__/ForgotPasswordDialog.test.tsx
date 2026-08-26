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

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: (...a: unknown[]) => toastMock(...a) }));

import { ForgotPasswordDialog } from "../ForgotPasswordDialog";

function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: /esqueci minha senha/i }));
}

describe("ForgotPasswordDialog", () => {
  beforeEach(() => {
    toastMock.mockReset();
    h.mock = createSupabaseMock();
  });

  it("abre o dialogo pelo link do formulario de login", async () => {
    renderWithProviders(<ForgotPasswordDialog />);
    openDialog();
    expect(await screen.findByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  // Valores malformados ("abc") sao barrados antes pela validacao nativa do
  // <input type="email">; o zod cobre o que passa por ela — inclusive o vazio.
  it("bloqueia o envio com e-mail vazio", async () => {
    renderWithProviders(<ForgotPasswordDialog />);
    openDialog();
    await screen.findByLabelText(/e-mail/i);
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    expect(await screen.findByText("E-mail inválido")).toBeInTheDocument();
    expect(h.mock.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("envia o link apontando para /reset-password e fecha o dialogo", async () => {
    renderWithProviders(<ForgotPasswordDialog />);
    openDialog();
    const email = await screen.findByLabelText(/e-mail/i);
    fireEvent.change(email, { target: { value: " a@b.com " } });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    await waitFor(() => expect(h.mock.auth.resetPasswordForEmail).toHaveBeenCalledTimes(1));
    expect(h.mock.auth.resetPasswordForEmail).toHaveBeenCalledWith("a@b.com", {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: "E-mail enviado" })),
    );
    await waitFor(() => expect(screen.queryByLabelText(/e-mail/i)).not.toBeInTheDocument());
  });

  it("mostra toast destrutivo quando a API falha", async () => {
    h.mock = createSupabaseMock({ authErrors: { resetPasswordForEmail: { message: "rate limit" } } });
    renderWithProviders(<ForgotPasswordDialog />);
    openDialog();
    const email = await screen.findByLabelText(/e-mail/i);
    fireEvent.change(email, { target: { value: "a@b.com" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive", description: "rate limit" }),
      ),
    );
  });
});
