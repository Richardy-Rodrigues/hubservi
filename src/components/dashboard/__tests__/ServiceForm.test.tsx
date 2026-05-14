import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServiceForm } from "../ServiceForm";
import { Providers } from "@/test/utils";

const insertMock = vi.fn();
const toastMock = vi.fn();
const onClose = vi.fn();
const onSaved = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "prov-1" } }),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: (...args: unknown[]) => insertMock(table, ...args),
    }),
  },
}));

const baseService = {
  title: "Servico existente",
  description: "Descricao longa o suficiente para o schema",
  category_id: "11111111-1111-1111-1111-111111111111",
  price_min: 100,
  price_max: 100,
  price_type: "fixed",
  location: "",
  is_active: true,
};

describe("ServiceForm schema guardrails", () => {
  beforeEach(() => {
    insertMock.mockReset();
    toastMock.mockReset();
    onClose.mockReset();
    onSaved.mockReset();
  });

  it("rejects titles shorter than 3 chars", async () => {
    render(
      <Providers>
        <ServiceForm onClose={onClose} onSaved={onSaved} />
      </Providers>,
    );

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: "ab" } });
    fireEvent.click(screen.getByRole("button", { name: /criar serviço/i }));

    expect(
      await screen.findByText(/título deve ter pelo menos 3 caracteres/i),
    ).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects when price_max is smaller than price_min", async () => {
    render(
      <Providers>
        <ServiceForm service={baseService} onClose={onClose} onSaved={onSaved} />
      </Providers>,
    );

    fireEvent.change(screen.getByLabelText(/preço mínimo/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/preço máximo/i), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(
      await screen.findByText(/preço máximo deve ser maior ou igual ao mínimo/i),
    ).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });
});
