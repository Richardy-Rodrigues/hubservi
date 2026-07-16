import { describe, it, expect } from "vitest";
import { serviceSchema } from "../service";

// Testes puros do schema (sem DOM, sem mock). O .refine(price_max >= price_min)
// espelha a CHECK services_price_range_check no banco — validado em ambas as camadas.

const base = {
  title: "Servico valido",
  description: "descricao com dez+",
  category_id: "00000000-0000-0000-0000-0000000000c1",
  price_min: 100,
  price_max: null as number | null,
  price_type: "fixed" as const,
  is_active: true,
};

describe("serviceSchema", () => {
  it("aceita um servico valido", () => {
    expect(serviceSchema.safeParse(base).success).toBe(true);
  });

  it("rejeita titulo com menos de 3 caracteres", () => {
    const r = serviceSchema.safeParse({ ...base, title: "ab" });
    expect(r.success).toBe(false);
  });

  it("rejeita descricao com menos de 10 caracteres", () => {
    const r = serviceSchema.safeParse({ ...base, description: "curta" });
    expect(r.success).toBe(false);
  });

  it("rejeita category_id que nao e uuid", () => {
    const r = serviceSchema.safeParse({ ...base, category_id: "nao-uuid" });
    expect(r.success).toBe(false);
  });

  it("rejeita price_min negativo", () => {
    const r = serviceSchema.safeParse({ ...base, price_min: -1 });
    expect(r.success).toBe(false);
  });

  it("rejeita price_max menor que price_min", () => {
    const r = serviceSchema.safeParse({ ...base, price_min: 200, price_max: 100 });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path).toContain("price_max");
    }
  });

  it("aceita price_max igual ou maior que price_min", () => {
    expect(serviceSchema.safeParse({ ...base, price_min: 100, price_max: 100 }).success).toBe(true);
    expect(serviceSchema.safeParse({ ...base, price_min: 100, price_max: 250 }).success).toBe(true);
  });

  it("aceita price_max nulo (preco em aberto)", () => {
    expect(serviceSchema.safeParse({ ...base, price_max: null }).success).toBe(true);
  });
});
