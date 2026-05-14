import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BookingDialog } from "../BookingDialog";

const useAuthMock = vi.fn();
const insertMock = vi.fn();
const toastMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: (...args: unknown[]) => insertMock(...args),
    }),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

function renderDialog(props = { serviceId: "svc-1", providerId: "prov-1", serviceTitle: "Limpeza" }) {
  return render(
    <MemoryRouter>
      <BookingDialog {...props} />
    </MemoryRouter>,
  );
}

describe("BookingDialog", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    insertMock.mockReset();
    toastMock.mockReset();
    navigateMock.mockReset();
  });

  it("offers a login CTA when there is no authenticated user", () => {
    useAuthMock.mockReturnValue({ user: null, profile: null });
    renderDialog();
    const btn = screen.getByRole("button", { name: /entre para solicitar/i });
    fireEvent.click(btn);
    expect(navigateMock).toHaveBeenCalledWith("/auth");
  });

  it("renders nothing for provider profiles", () => {
    useAuthMock.mockReturnValue({
      user: { id: "client-1" },
      profile: { user_type: "provider" },
    });
    const { container } = renderDialog();
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when the logged user is the service owner", () => {
    useAuthMock.mockReturnValue({
      user: { id: "prov-1" },
      profile: { user_type: "client" },
    });
    const { container } = renderDialog();
    expect(container.firstChild).toBeNull();
  });

  it("blocks submission with empty message and inserts when filled in", async () => {
    useAuthMock.mockReturnValue({
      user: { id: "client-1" },
      profile: { user_type: "client" },
    });
    insertMock.mockResolvedValue({ error: null });

    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /solicitar serviço/i }));

    const submit = await screen.findByRole("button", { name: /enviar solicitação/i });
    fireEvent.click(submit);
    expect(insertMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );

    fireEvent.change(screen.getByLabelText(/descreva o que você precisa/i), {
      target: { value: "Preciso de uma limpeza completa" },
    });
    fireEvent.click(submit);

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        service_id: "svc-1",
        provider_id: "prov-1",
        client_id: "client-1",
        message: "Preciso de uma limpeza completa",
      }),
    );
  });
});
