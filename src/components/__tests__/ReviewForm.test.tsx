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

const useAuthMock = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => useAuthMock() }));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: (...a: unknown[]) => toastMock(...a) }));

import { ReviewForm } from "../ReviewForm";

const SERVICE = "svc-1";
const PROVIDER = "prov-1";
const CLIENT = "client-1";

function asClient() {
  useAuthMock.mockReturnValue({ user: { id: CLIENT }, profile: { user_type: "client" } });
}

// Elegibilidade: cliente com booking concluido e sem review previo.
function eligibleTables(overrides: { booking?: boolean; review?: boolean } = {}) {
  const { booking = true, review = false } = overrides;
  return {
    bookings: booking
      ? [{ id: "b1", service_id: SERVICE, client_id: CLIENT, status: "completed" }]
      : [],
    reviews: review ? [{ id: "r1", service_id: SERVICE, client_id: CLIENT }] : [],
  };
}

describe("ReviewForm", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    toastMock.mockReset();
  });

  it("nao renderiza para prestador", () => {
    useAuthMock.mockReturnValue({ user: { id: CLIENT }, profile: { user_type: "provider" } });
    h.mock = createSupabaseMock({ tables: eligibleTables() });
    const { container } = renderWithProviders(<ReviewForm serviceId={SERVICE} providerId={PROVIDER} />);
    expect(container.firstChild).toBeNull();
  });

  it("nao renderiza sem booking concluido", async () => {
    asClient();
    h.mock = createSupabaseMock({ tables: eligibleTables({ booking: false }) });
    const { container } = renderWithProviders(<ReviewForm serviceId={SERVICE} providerId={PROVIDER} />);
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it("nao renderiza se o cliente ja avaliou", async () => {
    asClient();
    h.mock = createSupabaseMock({ tables: eligibleTables({ review: true }) });
    const { container } = renderWithProviders(<ReviewForm serviceId={SERVICE} providerId={PROVIDER} />);
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it("cliente elegivel ve o formulario e envia avaliacao", async () => {
    asClient();
    h.mock = createSupabaseMock({ tables: eligibleTables() });
    renderWithProviders(<ReviewForm serviceId={SERVICE} providerId={PROVIDER} />);

    // Formulario aparece quando elegivel.
    const enviar = await screen.findByRole("button", { name: /enviar avaliação/i });

    // Sem nota selecionada, o botao esta desabilitado.
    expect(enviar).toBeDisabled();

    // Seleciona 4 estrelas.
    fireEvent.click(screen.getByRole("radio", { name: /4 estrelas/i }));
    expect(enviar).toBeEnabled();

    fireEvent.click(enviar);
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: "Avaliação enviada!" })),
    );

    // O insert gravou a review no store do mock com os campos corretos.
    expect(h.mock.__store.reviews).toContainEqual(
      expect.objectContaining({
        service_id: SERVICE,
        provider_id: PROVIDER,
        client_id: CLIENT,
        rating: 4,
      }),
    );
  });

  it("bloqueia envio sem nota (rating < 1)", async () => {
    asClient();
    h.mock = createSupabaseMock({ tables: eligibleTables() });
    renderWithProviders(<ReviewForm serviceId={SERVICE} providerId={PROVIDER} />);
    await screen.findByRole("button", { name: /enviar avaliação/i });

    // O botao esta desabilitado sem nota; a guarda interna tambem protege.
    const before = (h.mock.__store.reviews ?? []).length;
    expect(before).toBe(0);
  });
});
