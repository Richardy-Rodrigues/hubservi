# Prints de tela das execuções das ferramentas

Capturas de tela das saídas das ferramentas de medição, para apresentação. Complementam — não substituem — os arquivos brutos em `evidencias/AAAA-MM-DD/`, que continuam sendo a evidência primária citada em [`registro-medicoes.md`](../../registro-medicoes.md).

## Nota de método (vale como legenda de todas as imagens)

As imagens **reencenam na tela as saídas preservadas** das execuções de **2026-07-15 e 2026-07-16**, no commit `ad89e6c`. **Nenhuma medição foi re-executada para produzi-las** — é o que garante que cada número visível nas capturas seja idêntico ao reportado na Seção 7 do artigo.

A reencenação é literal, não uma reescrita:

- **Terminal** — os `.log` do Vitest são impressos byte a byte, com as sequências ANSI originais, de modo que o vermelho das falhas e o verde dos controles são os da execução real (`replay-evidencia.ps1` escreve via `[Console]::Write`, sem passar pelo pipeline do PowerShell, justamente para não perdê-las).
- **Navegador** — os JSONs do ESLint e do Lighthouse são renderizados pelo **relatório oficial da própria ferramenta**: o `eslint-report.json` já é o array `results` da API do ESLint, e os `lighthouse-*.json` são LHR completos, reconstruídos pelo `ReportGenerator` da versão 12.8.2 (a mesma registrada no campo `lighthouseVersion` do arquivo).

Cada tela de terminal traz um cabeçalho com a medição, a data da execução, o commit e o comando; nos relatórios HTML do ESLint, o carimbo "Generated on" (que marca a geração do HTML, não a medição) foi substituído pela data da execução. Nos do Lighthouse a data já vem do próprio LHR (`fetchTime` de 2026-07-16).

Vale registrar por que a reencenação é o caminho correto aqui, e não um atalho: a branch está **18 commits à frente** de `ad89e6c`, com funcionalidades acrescentadas depois das medições (recuperação de senha, formulário de avaliação, cancelamento de agendamento). Re-executar as ferramentas hoje produziria números diferentes dos que a Seção 7 reporta — e o `rls-furos-ANTES.log` (P-11) sequer é reproduzível, já que o furo de PII foi corrigido. As saídas registradas são, portanto, a única forma de a imagem corresponder ao texto.

## Como gerar as telas

```powershell
# 1. relatórios HTML nativos (ESLint e Lighthouse) — uma vez
npm install --no-save lighthouse@12.8.2     # ver nota abaixo
node docs/tcc/medicoes/scripts/gerar-relatorios-html.mjs

# 2. as telas, no Windows Terminal
.\docs\tcc\medicoes\scripts\replay-evidencia.ps1 -List      # lista as 18
.\docs\tcc\medicoes\scripts\replay-evidencia.ps1 -Id P-11   # uma tela
.\docs\tcc\medicoes\scripts\replay-evidencia.ps1 -All       # todas, com pausa entre elas
```

O Lighthouse é instalado com `--no-save` **de propósito**: gravá-lo como dependência alteraria o grafo de 825 pacotes que a medição M-25 (`npm audit`) reporta. Ele é usado apenas como renderizador do relatório. Alternativa sem instalar nada: abrir <https://googlechrome.github.io/lighthouse/viewer/> e arrastar os arquivos `lighthouse-3.json` e `lighthouse-split-2.json` (o processamento é no navegador).

## Convenção de captura

- **Windows Terminal** maximizado, fonte em ~16 pt — o texto precisa sobreviver à redução do slide/impressão.
- `Win+Shift+S` → recorte de janela → salvar nesta pasta como `P-xx-nome.png`.
- Enquadrar o cabeçalho da tela junto com a saída: é ele que identifica a medição na imagem.
- As telas do ESLint e do Lighthouse são capturas **do navegador**, não do terminal.

## Índice

| Print | Medição | Ferramenta | O que a imagem mostra | Fonte em `evidencias/` |
|-------|---------|-----------|------------------------|------------------------|
| P-01 | contexto | — | SO, CPU, node v24.14.0, versões das ferramentas, commit `ad89e6c`, stack Supabase local | `2026-07-15/ambiente.txt`, `2026-07-16/ambiente.txt` |
| P-02 | M-01 | Vitest 3.2.7 | suíte unitária do baseline, verde | `2026-07-15/vitest-unit.log` |
| P-03 | M-01b | Vitest + coverage-v8 | cobertura Semana 5: **31,99%** linhas (559/1747), **75%** ramos, 48,38% funções | `2026-07-16/coverage-semana5.txt`, `coverage-summary-semana5.json` |
| P-04 | M-02 | ESLint 9.32 | relatório HTML: **19 erros, 9 avisos** (configuração do projeto) | `2026-07-15/eslint-report.json` |
| P-05 | M-21 | ESLint + sonarjs 3 | relatório HTML: **25 erros, 4 avisos** (configuração de medição) | `2026-07-16/eslint-sonarjs-report.json` |
| P-06 | M-03 | Madge 8 | 85 arquivos processados, **nenhuma dependência circular listada** | `2026-07-15/madge-circular.txt` |
| P-07 | M-22 | jscpd 4 | **3,03%** de duplicação — 10 clones, 107 de 3.528 linhas | `2026-07-16/jscpd/jscpd-report.json` |
| P-08 | M-23/M-24 | dependency-cruiser 16 | instabilidade por módulo: folhas em 90–100%, núcleo (`lib/utils` 4%, `client.ts` 8%, `AuthContext` 13%) | `2026-07-16/depcruise-metrics.txt` |
| P-09 | M-04/M-05 | Supabase CLI + Vitest | `db reset` reproduz 10 migrations + seed; smoke de integração 4/4 | `2026-07-16/ambiente.txt`, `vitest-integration.log` |
| P-10 | M-05..M-13 | Vitest (integração) | suíte completa de RLS e triggers contra PostgREST real | `2026-07-16/suite-integracao-completa.log` |
| P-11 | F-02/F-03 | Vitest (integração) | **ANTES**: 2 falhas em vermelho, com o vazamento literal `"email": "provider_b@test.local"` | `2026-07-16/rls-furos-ANTES.log` |
| P-12 | F-02/F-03 | Vitest (integração) | **DEPOIS**: os mesmos testes em verde, após as migrations de correção | `2026-07-16/rls-furos-DEPOIS.log` |
| P-13 | F-01 | psql | privilégios de API concedidos a `anon`/`authenticated`/`service_role` em `profiles` | `2026-07-16/grants-profiles-depois.txt` |
| P-14 | M-14..M-17 | Lighthouse 12.8.2 | relatório completo da execução mediana: **score 85, LCP 3,5 s** (antes do code-split) | `2026-07-16/lighthouse-3.json`, `lighthouse-resumo.txt` |
| P-15 | M-14..M-17 | Lighthouse 12.8.2 | relatório completo da execução mediana: **score 88, LCP 3,2 s** (depois do code-split) | `2026-07-16/lighthouse-split-2.json`, `lighthouse-split-resumo.txt` |
| P-16 | M-18..M-20 | autocannon 8 | smoke e carga: **44.413 req, 2.221 req/s, 0 erros, 0 non-2xx** | `2026-07-16/autocannon-smoke.json`, `autocannon-load.json` |
| P-17 | M-25 | npm audit | **12 altas, 8 moderadas, 0 críticas** em 825 dependências | `2026-07-16/npm-audit.json` |
| P-18 | M-26 | supabase db lint | `No schema errors found` | `2026-07-16/supabase-db-lint.txt` |

### Se for preciso reduzir o conjunto

Oito telas cobrem os cinco atributos da ISO/IEC 25010 avaliados e o argumento metodológico do trabalho:

**P-01** (reprodutibilidade) · **P-03** (testabilidade) · **P-04** (manutenibilidade) · **P-10** (segurança e confiabilidade) · **P-11 + P-12** (o par antes/depois — o instrumento reprova o sistema vulnerável e aprova o corrigido) · **P-14** (desempenho, critério não atendido) · **P-17** (dependências).

O par **P-11/P-12** é o print mais forte do conjunto: é a evidência de que os testes têm poder de detecção, sem a qual um painel inteiramente verde nada demonstraria (§5.4 e a nota metodológica do `registro-medicoes.md`).

## Recortes declarados

Duas telas não exibem o arquivo inteiro, e o próprio print informa isso:

- **P-08** — `depcruise-metrics.txt` tem 2.603 linhas (inclui `node_modules`). A tela filtra para módulos e pastas de `src/`, excluindo testes e o shadcn vendorizado (`components/ui/`), e mostra o topo e o fim da lista ordenada por instabilidade — que é o par folhas voláteis / núcleo estável descrito no M-24. O aviso de filtro e a contagem `43 de 2.603` aparecem na imagem.
- **P-03, P-07, P-17** — dos JSONs grandes, a tela imprime o nó relevante (`.total`, `.statistics.total`, `.metadata`), com o nome do campo extraído visível.

## Observação para conferência antes da defesa

O campo `latency_p95_ms` de `autocannon-load.json` (P-16) é preenchido em `tests/load/load-services.mjs` com `r.latency.p97_5`, não com o p95 do autocannon. O valor de **253 ms** que aparece no print e no artigo é, portanto, o **p97,5** — mais conservador que o p95, e ainda muito abaixo do critério de 800 ms, de modo que o veredito do M-18 não muda. Convém alinhar o rótulo (no script ou no texto) antes da defesa.
