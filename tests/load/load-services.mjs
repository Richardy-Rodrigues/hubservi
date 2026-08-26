// Teste de carga da listagem de servicos (§5.2.2). Alvo: endpoint PostgREST de
// leitura publica de servicos ativos, exercitado como o cliente anonimo o faria.
// Metricas: latencia de cauda, vazao (req/s), taxa de erro. Substitui k6 por
// autocannon (ambos HTTP load testers; a substituicao esta registrada na metodologia).
//
// PERCENTIL REPORTADO (M-18). O autocannon nao emite p95 no conjunto padrao de
// percentis do seu histograma — os vizinhos sao p90 e p97_5. O trabalho reporta
// portanto o **p97,5**, que e MAIS CONSERVADOR que o p95 pedido pelo criterio de
// §5.2.2: se p97,5 <= 800 ms, entao p95 <= 800 ms necessariamente. O campo abaixo
// leva o nome do percentil que de fato contem, para que o rotulo nao prometa
// mais precisao do que a ferramenta entrega.
import autocannon from "autocannon";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

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

// Uma nova execucao e uma nova rodada de coleta, e vai para o diretorio do dia
// (regra 4 do protocolo em docs/tcc/medicoes/README.md). Escrever no diretorio de
// 2026-07-16, como esta versao fazia, SOBRESCREVERIA a evidencia que o artigo cita.
const hoje = new Date().toISOString().slice(0, 10);
const destino =
  process.env.EVID_DIR ?? join("docs", "tcc", "medicoes", "evidencias", hoje);

instance.on("done", (r) => {
  const out = {
    mode,
    connections: cfg.connections,
    duration_s: cfg.duration,
    requests_total: r.requests.total,
    rps_mean: r.requests.mean,
    latency_p50_ms: r.latency.p50,
    latency_p90_ms: r.latency.p90,
    // Percentil de cauda efetivamente reportado — ver nota no topo do arquivo.
    latency_p97_5_ms: r.latency.p97_5,
    // Presente apenas se a versao do autocannon expuser p95; nulo caso contrario.
    latency_p95_ms: r.latency.p95 ?? null,
    latency_p99_ms: r.latency.p99,
    latency_max_ms: r.latency.max,
    non2xx: r.non2xx,
    errors: r.errors,
    timeouts: r.timeouts,
  };
  const path = join(destino, `autocannon-${mode}.json`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  console.log(`-> ${path}`);
});
