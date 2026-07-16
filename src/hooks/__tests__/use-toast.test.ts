import { describe, it, expect } from "vitest";
import { reducer } from "../use-toast";

// Redutor puro do toast (TOAST_LIMIT = 1). Testa as quatro acoes sem tocar o DOM.
type State = { toasts: Array<Record<string, unknown>> };
const t = (id: string) => ({ id, title: `t${id}`, open: true });

describe("use-toast reducer", () => {
  it("ADD_TOAST adiciona e respeita o limite de 1", () => {
    let s: State = { toasts: [] };
    s = reducer(s, { type: "ADD_TOAST", toast: t("1") } as never);
    expect(s.toasts).toHaveLength(1);
    s = reducer(s, { type: "ADD_TOAST", toast: t("2") } as never);
    expect(s.toasts).toHaveLength(1);
    expect(s.toasts[0].id).toBe("2");
  });

  it("UPDATE_TOAST altera apenas o toast de mesmo id", () => {
    const s0: State = { toasts: [t("1")] };
    const s1 = reducer(s0, { type: "UPDATE_TOAST", toast: { id: "1", title: "novo" } } as never);
    expect(s1.toasts[0].title).toBe("novo");
  });

  it("DISMISS_TOAST marca open=false", () => {
    const s0: State = { toasts: [t("1")] };
    const s1 = reducer(s0, { type: "DISMISS_TOAST", toastId: "1" } as never);
    expect(s1.toasts[0].open).toBe(false);
  });

  it("REMOVE_TOAST remove por id e limpa tudo quando id e indefinido", () => {
    const s0: State = { toasts: [t("1")] };
    const s1 = reducer(s0, { type: "REMOVE_TOAST", toastId: "1" } as never);
    expect(s1.toasts).toHaveLength(0);

    const s2 = reducer({ toasts: [t("1")] }, { type: "REMOVE_TOAST", toastId: undefined } as never);
    expect(s2.toasts).toHaveLength(0);
  });
});
