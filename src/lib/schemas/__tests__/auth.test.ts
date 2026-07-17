import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "../auth";

describe("loginSchema", () => {
  it("aceita e-mail e senha validos", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123456" }).success).toBe(true);
  });
  it("rejeita e-mail invalido", () => {
    expect(loginSchema.safeParse({ email: "invalido", password: "123456" }).success).toBe(false);
  });
  it("rejeita senha com menos de 6 caracteres", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = { email: "a@b.com", password: "123456", fullName: "Fulano", userType: "client" as const };

  it("aceita cadastro valido de cliente e de prestador", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, userType: "provider" }).success).toBe(true);
  });
  it("rejeita nome com menos de 2 caracteres", () => {
    expect(registerSchema.safeParse({ ...base, fullName: "F" }).success).toBe(false);
  });
  it("rejeita userType fora do enum", () => {
    expect(registerSchema.safeParse({ ...base, userType: "admin" }).success).toBe(false);
  });
});
