import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema, newPasswordSchema } from "../auth";

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

describe("forgotPasswordSchema", () => {
  it("aceita e-mail valido", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });
  it("rejeita e-mail invalido", () => {
    expect(forgotPasswordSchema.safeParse({ email: "invalido" }).success).toBe(false);
  });
});

describe("newPasswordSchema", () => {
  it("aceita senhas iguais com no minimo 6 caracteres", () => {
    expect(
      newPasswordSchema.safeParse({ password: "123456", confirmPassword: "123456" }).success,
    ).toBe(true);
  });
  it("rejeita senha com menos de 6 caracteres", () => {
    expect(newPasswordSchema.safeParse({ password: "123", confirmPassword: "123" }).success).toBe(
      false,
    );
  });
  it("rejeita confirmacao divergente apontando o campo confirmPassword", () => {
    const result = newPasswordSchema.safeParse({ password: "123456", confirmPassword: "654321" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toEqual(["confirmPassword"]);
      expect(result.error.errors[0].message).toBe("As senhas não coincidem");
    }
  });
});
