import { vi } from "vitest";

// Factory de mock do cliente Supabase para testes unitarios/componente. Substitui
// os mocks ad-hoc encadeados que cada teste remontava a mao. O builder e
// encadeavel E thenable (suporta `await supabase.from(x).select()` e os terminais
// .single()/.maybeSingle()). NAO substitui os testes de integracao: aqui o objetivo
// e medir testabilidade isolando o componente; a fidelidade HTTP real fica na suite
// contra o Supabase local.

type Row = Record<string, unknown>;
export type MockTables = Record<string, Row[]>;

interface MockConfig {
  tables?: MockTables;
  // Erro a retornar em qualquer operacao terminal sobre a tabela indicada.
  errors?: Record<string, { message: string } | null>;
  session?: unknown;
  // Erro a retornar por metodo de supabase.auth (ex.: resetPasswordForEmail).
  authErrors?: Partial<Record<"resetPasswordForEmail" | "updateUser", { message: string }>>;
}

type Predicate = (r: Row) => boolean;

class QueryBuilder {
  private filters: Predicate[] = [];
  private op: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | Row[] | null = null;

  constructor(
    private store: MockTables,
    private table: string,
    private errors: Record<string, { message: string } | null>,
  ) {}

  select() {
    return this;
  }
  order() {
    return this;
  }
  limit() {
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }
  neq(col: string, val: unknown) {
    this.filters.push((r) => r[col] !== val);
    return this;
  }
  insert(payload: Row | Row[]) {
    this.op = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: Row) {
    this.op = "update";
    this.payload = payload;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }

  private matched(): Row[] {
    const all = this.store[this.table] ?? [];
    return all.filter((r) => this.filters.every((f) => f(r)));
  }

  private resolve(): { data: unknown; error: { message: string } | null } {
    const error = this.errors[this.table] ?? null;
    if (error) return { data: null, error };

    if (this.op === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      (this.store[this.table] ??= []).push(...items);
      return { data: items, error: null };
    }
    if (this.op === "update") {
      const rows = this.matched();
      rows.forEach((r) => Object.assign(r, this.payload));
      return { data: rows, error: null };
    }
    if (this.op === "delete") {
      const removed = this.matched();
      this.store[this.table] = (this.store[this.table] ?? []).filter(
        (r) => !this.filters.every((f) => f(r)),
      );
      return { data: removed, error: null };
    }
    return { data: this.matched(), error: null };
  }

  private first() {
    const { data, error } = this.resolve();
    return { data: error ? null : ((data as Row[])[0] ?? null), error };
  }

  single() {
    return Promise.resolve(this.first());
  }
  maybeSingle() {
    return Promise.resolve(this.first());
  }
  // Thenable: torna o proprio builder aguardavel.
  then<T>(onFulfilled: (v: { data: unknown; error: unknown }) => T) {
    return Promise.resolve(this.resolve()).then(onFulfilled);
  }
}

export type SupabaseMock = ReturnType<typeof createSupabaseMock>;

export function createSupabaseMock(config: MockConfig = {}) {
  // Clona as tabelas para isolar cada teste de mutacoes (insert/update/delete).
  const store: MockTables = Object.fromEntries(
    Object.entries(config.tables ?? {}).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))]),
  );
  const errors = config.errors ?? {};
  const authErrors = config.authErrors ?? {};
  let session = config.session ?? null;
  const authListeners: Array<(event: string, s: unknown) => void> = [];

  return {
    from: (table: string) => new QueryBuilder(store, table, errors),
    auth: {
      onAuthStateChange: (cb: (event: string, s: unknown) => void) => {
        authListeners.push(cb);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
      getSession: () => Promise.resolve({ data: { session }, error: null }),
      signOut: () => {
        session = null;
        return Promise.resolve({ error: null });
      },
      resetPasswordForEmail: vi.fn((_email: string, _options?: unknown) =>
        Promise.resolve({ data: {}, error: authErrors.resetPasswordForEmail ?? null }),
      ),
      updateUser: vi.fn((_attrs: unknown) =>
        Promise.resolve({
          data: { user: authErrors.updateUser ? null : { id: "u1" } },
          error: authErrors.updateUser ?? null,
        }),
      ),
    },
    // Hooks de teste:
    __store: store,
    __emitAuth: (event: string, s: unknown) => {
      session = s;
      authListeners.forEach((cb) => cb(event, s));
    },
  };
}
