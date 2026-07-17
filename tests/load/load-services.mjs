// Teste de carga da listagem de servicos (§5.2.2). Alvo: endpoint PostgREST de
// leitura publica de servicos ativos, exercitado como o cliente anonimo o faria.
// Metrica: latencia p95, vazao (req/s), taxa de erro. Substitui k6 por autocannon
// (ambos HTTP load testers; a substituicao esta registrada na metodologia).
import autocannon from "autocannon";
import { writeFileSync } from "node:fs";

const URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

// smoke: 5 conexoes/5s (baseline p/ calibrar limiar); load: 30 conexoes/20s.
const mode = process.argv[2] === "load" ? "load" : "smoke";
const cfg = mode === "load" ? { connections: 30, duration: 20 } : { connections: 5, duration: 5 };

const instance = autocannon({
  url: `${URL}/rest/v1/services?is_active=eq.true&select=id,title,price_min,price_type&order=created_at.desc&limit=20`,
  method: "GET",
  headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  ...cfg,
});

autocannon.track(instance, { renderProgressBar: false });

instance.on("done", (r) => {
  const out = {
    mode,
    connections: cfg.connections,
    duration_s: cfg.duration,
    requests_total: r.requests.total,
    rps_mean: r.requests.mean,
    latency_p50_ms: r.latency.p50,
    latency_p95_ms: r.latency.p97_5 ?? r.latency.p95,
    latency_p99_ms: r.latency.p99,
    latency_max_ms: r.latency.max,
    non2xx: r.non2xx,
    errors: r.errors,
    timeouts: r.timeouts,
  };
  const path = `docs/tcc/medicoes/evidencias/2026-07-16/autocannon-${mode}.json`;
  writeFileSync(path, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  console.log(`-> ${path}`);
});
