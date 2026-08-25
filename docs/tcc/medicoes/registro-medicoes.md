# Registro de medições

Tabela mestra de todas as medições realizadas. Cada linha remete a um arquivo de evidência em `evidencias/AAAA-MM-DD/` e ao commit em que foi coletada. Protocolo e comandos de reprodução em [README.md](README.md).

> **Estado do repositório nas coletas — verificação de reprodutibilidade (2026-08-20).**
>
> As medições foram coletadas sobre a **árvore de trabalho**, não sobre um commit: o `ambiente.txt` de 2026-07-15 declara `Arvore de trabalho limpa: NAO`. A verificação conduzida para o [Apêndice B](../apendice-b-reproducao.md) determinou a que commit cada coleta corresponde, e o resultado é registrado aqui na íntegra — inclusive a parte desfavorável, conforme a regra 3 do [protocolo](README.md).
>
> | Coleta | Commit que reproduz | Situação |
> |---|---|---|
> | Baseline, Semana 1 (M-02, M-03) | `b2897c2` | **Reproduz exato** — 19 erros/9 avisos; 0 ciclos |
> | Baseline, Semana 1 (**M-01**) | *nenhum* | **Não reproduz** — ver abaixo |
> | Semanas 2–8 (M-01b, M-04…M-26) | `25ecace` | **Reproduz exato** — verificado em M-01b, M-21, M-22, M-03/M-23 |
> | Furos F-02/F-03 (antes) | `5e324f5` sem as 2 *migrations* de correção | Reproduz sob manipulação declarada |
>
> **Por que `25ecace`, e não um commit `docs(tcc)` da campanha.** A árvore medida em 2026-07-16 já continha `ReviewForm.tsx` e `ProfileForm.tsx`, arquivos então **não commitados**, que só entraram no histórico em `25ecace`. Nos commits `aa5df76`…`bb0bf13` estão os *testes* desses componentes **sem** os componentes — ali a suíte nem resolve os imports. É a mesma família de problema que F-01: o histórico versionado, sozinho, não reconstruía o estado avaliado.
>
> **M-01 (18,03%) não é reproduzível.** O `coverage-summary.json` de 2026-07-15 já lista `ReviewForm.tsx` e `ProfileForm.tsx` (esta com 62,5%). A árvore medida é o `src/` de `25ecace` com a suíte de 11 testes de `b2897c2` — combinação inexistente no histórico. Em `b2897c2`, a mesma medição dá **16,45%**. O veredito não muda (reprova o critério em ambos os casos, e a leitura de que a suíte cobria apenas quatro alvos pontuais permanece), mas o número **18,03% deve ser lido como não reproduzível**.

## Baseline — Semana 1 (fundação)

Estas são as **três primeiras medições reais** do trabalho. Registram o ponto de partida antes da ampliação da suíte e da configuração das ferramentas de segurança e desempenho. Os valores são propositalmente desfavoráveis em dois dos três casos — é o retrato honesto do estado atual, e a base contra a qual o progresso será medido.

| ID | Atributo (ISO/IEC 25010) | Cenário / métrica | Ferramenta + versão | Data | Valor | Critério | Veredito | Evidência |
|----|--------------------------|-------------------|---------------------|------|-------|----------|----------|-----------|
| M-01 | Manutenibilidade → testabilidade | Cobertura de linhas da suíte (global, exclusões conforme README) | Vitest 3.2.4 + coverage-v8 3.2.7 | 2026-07-15 | **18,03%** linhas / 67,9% ramos | ≥70% módulos críticos (a calibrar na Semana 5) | **Não atende** (baseline) | `evidencias/2026-07-15/coverage-summary.json` |
| M-01b | Manutenibilidade → testabilidade | Cobertura após ampliação da suíte (Semana 5) | Vitest 3.2.7 + coverage-v8 | 2026-07-16 | **31,99%** linhas global; **módulos críticos 82–100%** | Piso global 30% + módulos críticos ≥75% | **Atende** (limiares aplicados) | `evidencias/2026-07-16/coverage-summary-semana5.json` |
| M-02 | Manutenibilidade | Violações de *lint* (configuração atual do repositório) | ESLint 9.32 + typescript-eslint 8.38 | 2026-07-15 | **19 erros**, 9 avisos | Tendência a 0; sem erros | **Não atende** (baseline) | `evidencias/2026-07-15/eslint-report.json` |
| M-03 | Manutenibilidade | Dependências circulares no grafo de módulos de `src/` | Madge 8.0 | 2026-07-15 | **0 ciclos** (85 arquivos) | 0 ciclos | **Atende** | `evidencias/2026-07-15/madge-circular.txt` |

### Interpretação do baseline

- **M-01 (18,03%).** Número global sobre o código autoral. Está longe da meta porque a suíte atual (11 testes em 4 arquivos) cobre apenas quatro alvos pontuais; módulos centrais — `AuthContext`, `ReviewForm`, `views.ts`, o *reducer* de `use-toast`, o *schema* de `auth` — têm cobertura zero. Entre os já testados, a cobertura é alta (`ProtectedRoute` 100%, `BookingDialog` 98,6%, `Dashboard` 100%, `ServiceForm` 82,8%), o que indica que o esforço da Semana 5 é de **extensão**, não de reforço. A exclusão de `src/components/ui/**` é dirimente: essa pasta concentra **56%** das linhas de `src/` e corresponde à biblioteca shadcn/ui vendorizada (código de terceiros), cuja inclusão distorceria a medição de testabilidade do código próprio.
- **M-02 (19 erros).** O critério da Seção 5.2.4 ("tendência a 0; sem erros") **não é satisfeito hoje** — `npm run lint` termina em estado de erro. Das 19 violações, 16 são `@typescript-eslint/no-explicit-any`, concentradas em `ServiceDetail.tsx`, `ProviderDashboard.tsx` e nos *dashboards*. Registra-se ainda que a regra `@typescript-eslint/no-unused-vars` está **desativada** na configuração (`eslint.config.js:23`) e que o TypeScript não opera em modo *strict*; portanto, a contagem atual **subestima** o débito real. A análise da Semana 7 reportará dois pontos de dado — configuração atual vs. configuração com regras recomendadas — e discutirá a diferença.
- **M-03 (0 ciclos).** Único critério de manutenibilidade já satisfeito no baseline. A arquitetura de módulos de `src/` não apresenta dependências circulares.

## Semana 2 — achado de reprodutibilidade (F-01)

Ao levantar o ambiente de testes de integração (stack Supabase local, `supabase db reset` sobre uma instância limpa), constatou-se que **o histórico de migrations não reproduz um sistema funcional do zero**.

| ID | Tipo | Descrição | Data | Evidência | Situação |
|----|------|-----------|------|-----------|----------|
| F-01 | Reprodutibilidade / configuração | As *migrations* não concediam os privilégios de API (`SELECT/INSERT/UPDATE/DELETE`) aos papéis `anon`/`authenticated`/`service_role` no schema `public`. Em imagem recente do Postgres do Supabase (15.8.1.085), as *default privileges* do `public` concedem apenas `TRUNCATE/REFERENCES/TRIGGER`. Resultado: PostgREST retornava `42501 permission denied` **antes** de o RLS ser avaliado. | 2026-07-16 | `evidencias/2026-07-16/grants-profiles-depois.txt`, `ambiente.txt` | **Corrigido** por `supabase/migrations/20260716120000_grant_public_api_privileges.sql` |

**Por que isto importa para o trabalho.** É o risco R1 do plano (migrations manuais em produção, cf. commit `ad89e6c`) se materializando na dimensão de *grants*: o sistema funciona em produção porque lá os privilégios existem — aplicados fora do versionamento —, mas o histórico versionado, sozinho, não os recria. É exatamente o tipo de lacuna que só aparece quando a avaliação é conduzida sobre um ambiente reproduzível e controlado (a contribuição metodológica do trabalho). A correção torna o histórico auto-suficiente, sem alterar nenhuma política de RLS.

**Relação com os furos de segurança.** O GRANT é a porta grossa (o papel pode tocar a tabela); o RLS é a porta fina (quais linhas). A ausência do GRANT *mascarava* o furo de PII: sem ele, qualquer leitura de `profiles` falhava com `42501` antes de o RLS entrar em cena. Com o GRANT reproduzido, a política falha `USING (auth.uid() IS NOT NULL)` volta a ser o único controle — e o furo de exposição de PII a autenticados torna-se alcançável e mensurável na Semana 3.

## Semana 2 — infraestrutura de teste de integração validada

| ID | O que valida | Ferramenta + versão | Data | Valor | Veredito | Evidência |
|----|--------------|---------------------|------|-------|----------|-----------|
| M-04 | Migrations reproduzem do zero (10 migrations + seed) | Supabase CLI 2.109.1 | 2026-07-16 | `db reset` OK após F-01 | **Atende** (após correção) | `evidencias/2026-07-16/ambiente.txt` |
| M-05 | Autenticação por papel + trigger `handle_new_user` cria profile | Vitest 3.2.7 (integração) | 2026-07-16 | 4/4 testes verdes | **Atende** | `evidencias/2026-07-16/vitest-integration.log` |

O *smoke test* prova o pipeline completo: criação de usuário via *admin API* → *trigger* popula `profiles` com o `user_type` correto → login com senha → leitura do próprio perfil via PostgREST (RLS avaliado). É a fundação sobre a qual a suíte de RLS/triggers da Semana 3 será construída.

## Semana 3 — Segurança: dois furos medidos, corrigidos e re-medidos

Aplicação do ciclo **medir → detectar → corrigir → re-medir** aos dois furos identificados por inspeção. Cada furo foi primeiro exercitado por um teste que expressa o comportamento **seguro** — falhando contra o sistema vulnerável (evidência do furo) — e depois corrigido por *migration*, com o mesmo teste passando.

| ID | Atributo | Cenário (§5.2.1) | Métrica / critério | Ferramenta + versão | Data | Antes | Depois | Evidência |
|----|----------|------------------|--------------------|---------------------|------|-------|--------|-----------|
| F-02 | Segurança | Exposição de PII (`email`/`phone`) a autenticado não relacionado | 0 campos expostos | Vitest 3.2.7 (integração, PostgREST real) | 2026-07-16 | **Reprova**: `client_a` lê `provider_b@test.local` | **Atende**: leitura direta de `profiles` restrita ao próprio registro | `rls-furos-ANTES.log` → `rls-furos-DEPOIS.log` |
| F-03 | Segurança | Cliente avalia prestador que não é o dono do serviço | Tentativa bloqueada (100%) | Vitest 3.2.7 (integração) | 2026-07-16 | **Reprova**: review com `provider_id` falso é aceita | **Atende**: *trigger* rejeita `provider_id` ≠ dono do serviço | `rls-furos-ANTES.log` → `rls-furos-DEPOIS.log` |

**Correções (sem efeito colateral na aplicação):**
- **F-02** — `supabase/migrations/20260716130000_fix_profiles_pii_exposure.sql` remove a policy `USING (auth.uid() IS NOT NULL)`. Verificou-se que a aplicação lê dados de contraparte exclusivamente pela *view* `public_profiles` (`src/integrations/supabase/views.ts`), que não expõe `email`/`phone` e roda em modo *definer* (independe do RLS do chamador). A única leitura direta de `profiles` é do próprio registro (`AuthContext`, `ProfileForm`). Nenhuma quebra.
- **F-03** — `supabase/migrations/20260716130100_validate_review_provider.sql` adiciona um *trigger* espelhando o de *bookings* (`validate_booking_provider`, `20260514100100`) — a assimetria que originava o furo.

**Cobertura de cenários (7 testes de integração de segurança, todos verdes após correção):** além dos dois furos, 5 controles asseguram que o comportamento legítimo permanece — anônimo não lê `profiles`; usuário lê o próprio perfil; `public_profiles` não expõe PII; review com prestador correto e *booking* concluído é aceita; review sem *booking* concluído é rejeitada.

> **Nota metodológica.** O par antes/depois é o resultado, não o painel verde final. Os arquivos `rls-furos-ANTES.log` (2 falhas, 5 controles verdes) e `rls-furos-DEPOIS.log` (11 verdes) documentam que o instrumento efetivamente reprova o sistema vulnerável — condição sem a qual um resultado favorável nada demonstraria.

## Semana 3 — suíte completa de RLS/triggers (Segurança + Confiabilidade)

Além dos dois furos, a suíte cobre os demais cenários de autorização (§5.2.1) e confiabilidade (§5.2.5), todos verificados contra a API real (PostgREST) com clientes autenticados por papel. **30 testes em 9 arquivos, todos verdes** após as correções — evidência em `evidencias/2026-07-16/suite-integracao-completa.log`.

| ID | Atributo | Cenário | Métrica / critério | Arquivo de teste | Data | Veredito |
|----|----------|---------|--------------------|------------------|------|----------|
| M-06 | Segurança | Escalonamento de privilégio (`user_type` client→provider) | 100% bloqueadas | `rls-user-type.test.ts` | 2026-07-16 | **Atende** |
| M-07 | Segurança | Isolamento de serviços por prestador (criar/editar de terceiros) | 0 acessos indevidos | `rls-services.test.ts` | 2026-07-16 | **Atende** |
| M-08 | Segurança | Isolamento de bookings + cancelamento restrito ao próprio pendente | 0 acessos indevidos | `rls-bookings.test.ts` | 2026-07-16 | **Atende** |
| M-09 | Segurança | Exposição de PII a anônimo e autenticado (F-02) | 0 campos expostos | `rls-pii.test.ts` | 2026-07-16 | **Atende** (após correção) |
| M-10 | Segurança | Review atribuída ao prestador correto + só após booking concluído (F-03) | tentativa indevida bloqueada | `rls-reviews.test.ts` | 2026-07-16 | **Atende** (após correção) |
| M-11 | Confiabilidade | Máquina de estados do booking (transições inválidas) | 0 transições inválidas aceitas | `trigger-booking-status.test.ts` | 2026-07-16 | **Atende** |
| M-12 | Confiabilidade | Integridade referencial em exclusão de serviço | 0 registros órfãos | `integrity-cascade.test.ts` | 2026-07-16 | **Atende** |
| M-13 | Confiabilidade | Fluxo crítico ponta a ponta (auth→service→booking→review) | 100% sucesso no caso válido | `flow-happy-path.test.ts` | 2026-07-16 | **Atende** |

Cada cenário inclui tanto o caso indevido (que deve ser barrado) quanto o controle legítimo (que deve funcionar), evitando o falso-verde de um teste que passa por nunca exercitar o caminho real. Com isto, os cenários de **segurança** (§5.2.1) e **confiabilidade** (§5.2.5) do plano estão cobertos por testes automatizados reprodutíveis; os itens de segurança externos (ZAP, Snyk) e de desempenho seguem para as semanas 4 e 6.

## Semana 5 — Testabilidade: ampliação da suíte unitária e definição do limiar

A suíte unitária passou de **11 para 44 testes**, cobrindo os módulos que antes tinham cobertura zero: `AuthContext`, `ReviewForm`, `ProfileForm`, `views.ts`, o *reducer* de `use-toast` e os *schemas* Zod. Introduziu-se uma **factory de mock do Supabase** (`src/test/supabaseMock.ts`) — encadeável e *thenable* — que substitui os mocks ad-hoc que cada teste remontava à mão, e um `renderWithProviders` compartilhado.

**Cobertura global: 18,03% → 31,99% de linhas.** O ganho concentra-se, deliberadamente, nos módulos críticos:

| Módulo crítico | Cobertura (linhas) |
|----------------|--------------------|
| `src/lib/schemas/service.ts`, `auth.ts` | 100% |
| `src/integrations/supabase/views.ts` | 100% |
| `src/components/BookingDialog.tsx` | 98,6% |
| `src/components/ProtectedRoute.tsx` | 100% |
| `src/components/dashboard/ProfileForm.tsx` | 96,3% |
| `src/components/ReviewForm.tsx` | 93,5% |
| `src/components/dashboard/ServiceForm.tsx` | 82,8% |
| `src/contexts/AuthContext.tsx` | 82,5% |

**Decisão de limiar (concretiza o "≥70% a definir" do §5.2.3).** O plano de métricas deixava a meta de cobertura em aberto. Definiu-se, com o *baseline* real em mãos, um esquema de **dois níveis** em `vitest.config.ts`:
- **Piso global de 30%**, anti-regressão — deliberadamente modesto, porque páginas e *dashboards* extensos (`ClientDashboard`, `ProviderDashboard`, `Services`, `Auth`) permanecem sem teste nesta fase e representam a maior parte das linhas não cobertas.
- **Módulos críticos com piso ≥75%**, enumerados explicitamente. `use-toast` fica de fora do conjunto crítico: seu *reducer* (a lógica de negócio) está coberto; o restante é *plumbing* vendorizado do shadcn.

A escolha é metodológica e está registrada: *definir o que é crítico* — e proteger justamente esses módulos com um limiar exigente — é mais honesto e mais útil que perseguir um número global inatingível sem antes testar código de terceiros ou telas extensas de baixa densidade lógica. Os limiares são verificados a cada `npm run test:coverage` (e no CI da Semana 8), falhando a execução se algum módulo crítico regredir.

## Semana 6 — Desempenho (Lighthouse): carregamento inicial da SPA

Medição do carregamento inicial da *home* sobre o *build* de produção (`vite build` + `vite preview`), com **3 execuções e reporte da mediana** (execução única de Lighthouse tem variância alta). Lighthouse 12.8.2, perfil padrão (mobile, com *throttling* de CPU 4× e rede *slow 4G* — as condições que a meta "≥90" pressupõe).

| ID | Atributo | Métrica | Critério (§5.2.2) | Data | Antes (eager) | Depois (code-split) | Veredito |
|----|----------|---------|-------------------|------|---------------|---------------------|----------|
| M-14 | Eficiência de desempenho | Performance score | ≥ 90 | 2026-07-16 | **85** | **88** | **Não atende** (melhorou) |
| M-15 | Eficiência de desempenho | LCP (Largest Contentful Paint) | ≤ 2,5 s | 2026-07-16 | **3,49 s** | **3,17 s** | **Não atende** (melhorou) |
| M-16 | Eficiência de desempenho | TBT (Total Blocking Time) | baixo | 2026-07-16 | 11 ms | **0 ms** | **Atende** |
| M-17 | Eficiência de desempenho | CLS (Cumulative Layout Shift) | ~0 | 2026-07-16 | 0,000 | 0,000 | **Atende** |

Evidência: `evidencias/2026-07-16/lighthouse-{1,2,3}.json` (antes), `lighthouse-split-{1,2,3}.json` (depois) e os resumos `lighthouse-resumo.txt` / `lighthouse-split-resumo.txt`.

**Diagnóstico → correção → re-medição.** A medição inicial reprovou nos dois critérios principais (score 85 < 90; LCP 3,49 s > 2,5 s), enquanto TBT e CLS eram ótimos — apontando o gargalo para o **tempo até renderizar**, não para interatividade ou estabilidade visual. A inspeção do *build* confirmou a causa: **bundle JavaScript único de 679 KB, com todas as rotas carregadas de forma *eager*** (`src/App.tsx` sem `React.lazy`). Aplicou-se **code-splitting por rota** (a *home* permanece *eager*; as demais viram *chunks* sob demanda), reduzindo o *bundle* inicial para **489 KB** (−28%). A re-medição mostrou melhora consistente (score +3, LCP −0,32 s), porém **ainda abaixo da meta**.

**Conclusão honesta.** O critério de desempenho **não é atendido** no estágio atual, mesmo após a otimização. O ganho do *code-splitting* é real mas parcial: o *chunk* de entrada (489 KB, dominado por React + Radix/shadcn) continua sendo o fator limitante do LCP sob *throttling* mobile. Fecha-se o ciclo com uma **recomendação registrada** — separação de *vendor chunks*, avaliação de biblioteca de gráficos mais leve e *preload* do recurso de LCP — cuja execução excede o escopo desta fase. Reportar a deficiência e quantificar o resíduo é resultado de avaliação; mascará-lo não seria.

### Semana 6 — Desempenho sob carga (listagem de serviços)

Teste de carga do endpoint público de listagem de serviços ativos (PostgREST), exercitado como o cliente anônimo o faria. **Substituição de ferramenta registrada:** o plano (§5.2.2) nomeia o k6, não disponível no ambiente; usou-se **autocannon 8** (também um *HTTP load tester*), que entrega as mesmas métricas (p95, vazão, taxa de erro). A substituição é análoga à já prevista para o JMeter e não altera a natureza do cenário.

**Definição do limiar de p95 (que o plano deixava "a definir").** Calibrou-se a partir do *baseline* observado: um *smoke run* (5 conexões/5 s) registrou p95 ≈ 57 ms. Fixou-se o critério em **p95 ≤ 800 ms** para leitura — folgadamente acima do observado e abaixo do limite de 1 s da heurística de Nielsen para resposta percebida como fluida — e **taxa de erro < 1%**.

| ID | Atributo | Métrica | Critério | Ferramenta | Data | Valor | Veredito |
|----|----------|---------|----------|------------|------|-------|----------|
| M-18 | Eficiência de desempenho | Latência de cauda (leitura sob carga) — **p97,5**, ver nota | ≤ 800 ms | autocannon 8 | 2026-07-16 | **253 ms** (30 conexões, 20 s, 44.413 req) | **Atende** |
| M-19 | Eficiência de desempenho | Taxa de erro sob carga | < 1% | autocannon 8 | 2026-07-16 | **0%** (0 non-2xx, 0 timeouts) | **Atende** |
| M-20 | Eficiência de desempenho | Vazão | (observacional) | autocannon 8 | 2026-07-16 | **≈ 2.221 req/s** | — |

Evidência: `evidencias/2026-07-16/autocannon-smoke.json` e `autocannon-load.json`. Reproduzível por `npm run load:seed && npm run load:run` com o stack local de pé.

> **Nota sobre o percentil reportado (correção de rótulo, 2026-08-20).** O autocannon **não emite p95** no conjunto padrão de percentis do seu histograma — os vizinhos são p90 e p97,5. O valor de **253 ms** é, portanto, o **p97,5**, e o campo do JSON de evidência que o carrega (`latency_p95_ms`) estava mal rotulado; `tests/load/load-services.mjs` passou a gravar `latency_p97_5_ms`, preservando `latency_p95_ms` apenas quando a ferramenta de fato o fornecer.
>
> A correção é de rótulo, não de resultado: **p97,5 é mais conservador que p95** — se p97,5 ≤ 800 ms, então p95 ≤ 800 ms necessariamente. O veredito "atende" permanece, com folga ainda maior do que a reportada. Optou-se por reetiquetar em vez de re-medir porque uma nova execução hoje correria sobre outra árvore e outro estado de máquina, produzindo um número que não corresponderia ao restante da Seção 7.

**Ameaça à validade (§5.4).** A medição corre contra o **stack Supabase local** (ambiente controlado, sem latência de rede real nem limites de plano gerenciado). O resultado é um **piso de desempenho da camada de dados** — a API responde à listagem com folga sob concorrência. Uma medição contra a instância gerenciada (rede + *rate limits* do *free tier*) tende a apresentar p95 maior; essa diferença é declarada como limite de validade externa. O contraste entre a API rápida (leitura p95 253 ms) e o carregamento inicial lento da SPA (LCP 3,17 s) localiza o gargalo de desempenho no **frontend (bundle)**, não no backend — insumo direto para a análise da Seção 7.

**Síntese da categoria Desempenho.** Backend sob carga: **atende** (p95 e erro dentro do critério). Frontend (carregamento inicial): **não atende** (LCP/score abaixo da meta mesmo após *code-splitting*). A avaliação, portanto, não emite um veredito único para "desempenho": distingue a camada que cumpre o requisito da que não cumpre — que é o tipo de resolução que uma avaliação técnica deve oferecer.

## Semana 7 — Manutenibilidade (análise estática local)

Ferramentas locais, sem dependência de serviço externo: **ESLint** (estilo/antipadrões), **eslint-plugin-sonarjs 3** (*code smells* + complexidade cognitiva), regra `complexity` (ciclomática), **jscpd 4** (duplicação) e **Madge + dependency-cruiser** (ciclos e acoplamento). Todas as medições excluem `src/components/ui/**` (shadcn vendorizado) e `types.ts` (gerado).

| ID | Cenário (§5.2.4) | Métrica | Critério | Ferramenta | Data | Valor | Veredito |
|----|------------------|---------|----------|------------|------|-------|----------|
| M-02 | Conformidade de estilo (config atual) | Violações de *lint* | Tendência a 0 | ESLint 9 | 2026-07-15 | **19 erros**, 9 avisos | **Não atende** |
| M-21 | *Code smells* e complexidade (config recomendada) | Violações adicionais | (2º ponto de dado) | ESLint + sonarjs 3 | 2026-07-16 | **25 erros + 4 avisos** (16 `no-explicit-any`, 4 `complexity>15`, *smells* sonarjs) | **Não atende** |
| M-22 | Duplicação de código | % de linhas duplicadas | ≤ 3% | jscpd 4 | 2026-07-16 | **TSX 4,55%** (agregado ts+tsx ~3,0%) | **Não atende** (camada UI) |
| M-03 | Modularização (ciclos) | Nº de dependências circulares | 0 | Madge 8 | 2026-07-15 | **0** | **Atende** |
| M-23 | Modularização (ciclos, 2ª ferramenta) | Nº de dependências circulares | 0 | dependency-cruiser 16 | 2026-07-16 | **0** (93 módulos, 0 violações) | **Atende** |
| M-24 | Acoplamento e estabilidade | Instabilidade por camada | (observacional) | dependency-cruiser 16 | 2026-07-16 | Núcleo estável, folhas voláteis | **Saudável** |

Evidência: `eslint-report.json` (atual), `eslint-sonarjs-report.json` (recomendada), `jscpd/jscpd-report.json`, `depcruise-metrics.txt`.

**Leitura dos resultados.**
- **Lint (M-02/M-21).** A configuração atual do projeto tem `no-unused-vars` desligado e o TypeScript não é *strict* — por isso "19 erros" **subestima** o débito. A configuração recomendada acusa **25 erros + 4 avisos**, revelando 6 *code smells* que a config atual esconde (condicionais aninhados, *dead store*, complexidade cognitiva, imports não usados) e **4 funções com complexidade ciclomática > 15**. Reportar os dois pontos de dado é análise; reportar só o primeiro seria subcontagem.
- **Duplicação (M-22).** No agregado fica na fronteira (~3,0%), mas a **camada de UI (TSX) tem 4,55%**, acima da meta. A causa é localizada e nomeável: **`ClientDashboard.tsx` e `ProviderDashboard.tsx` compartilham 61 linhas quase idênticas** — os dois maiores clones. É um alvo de refatoração concreto (extrair um componente/hook de painel comum), registrado como recomendação.
- **Modularização (M-03/M-23/M-24).** Zero ciclos, confirmado por **duas ferramentas independentes**. O grafo de dependências é saudável: o núcleo (`lib`, `contexts`, `integrations`) tem baixa instabilidade (é depended-upon e estável), enquanto `pages` e `dashboards` têm alta instabilidade (folhas que dependem de muitos e são dependidas por poucos) — exatamente o padrão esperado pelo princípio das dependências estáveis.

**Síntese da categoria Manutenibilidade.** Estrutura modular **sólida** (0 ciclos, acoplamento saudável); higiene de código **abaixo do ideal** (lint não zerado, agravado por regras desligadas; duplicação acima de 3% na UI, com culpado identificado). O veredito é misto e específico, com dois alvos de ação claros: (i) ligar as regras de *lint* recomendadas e tratar os `any`/complexidade; (ii) desduplicar os dois *dashboards*.

## Semana 4 — Segurança externa (SCA + advisors do banco)

Complementa a segurança já verificada por RLS (§5.2.1, testes de integração) com a análise das dependências e do schema.

| ID | Cenário (§5.2.1) | Métrica | Critério | Ferramenta | Data | Valor | Veredito |
|----|------------------|---------|----------|------------|------|-------|----------|
| M-25 | Vulnerabilidades em dependências | Nº de CVEs por severidade | 0 alta/crítica não tratadas | npm audit (substitui Snyk) | 2026-07-16 | **12 altas, 8 moderadas, 0 críticas** | **Não atende** (ver ressalva) |
| M-26 | Integridade do schema/funções | Erros de *lint* de schema | 0 | supabase db lint | 2026-07-16 | **0 erros** | **Atende** |

Evidência: `evidencias/2026-07-16/npm-audit.json`, `supabase-db-lint.txt`.

**Substituição de ferramenta registrada.** O plano nomeia o **Snyk** para SCA; ele exige conta/autenticação, indisponível no ambiente. Usou-se o **`npm audit`** (mesma classe — *Software Composition Analysis* sobre o *lockfile*), viabilizado pela consolidação do `package-lock.json` como único *lockfile* (achado da Semana 1). A substituição é análoga à do k6→autocannon.

**Ressalva crítica na leitura dos CVEs (produção vs. build).** Os 12 CVEs de severidade alta não são equivalentes em risco real:
- **11 dos 12 estão em ferramentas de build/desenvolvimento** — `vite`, `rollup`, `ws`, `glob`, `minimatch`, `picomatch`, `lodash`, `flatted`, `eslint-plugin-sonarjs` — que executam apenas em tempo de build/teste e **não têm superfície de ataque em produção** (não são servidas ao usuário).
- **1 é de produção:** `react-router-dom` (e seus transitivos `react-router`/`@remix-run/router`) — *XSS via open redirect* / redirecionamento externo por caminho não confiável. **Este é o único que merece prioridade**, por rodar no navegador do usuário; há correção por atualização de versão.

Reportar "12 altas" sem essa distinção seria alarmista; ignorá-las, negligente. A avaliação separa o CVE que expõe o usuário (react-router-dom) dos que só afetam o ambiente de build — e recomenda a atualização dirigida do primeiro. A maioria possui *fix* disponível via `npm audit fix`, cuja aplicação (com verificação de regressão) fica como recomendação para não introduzir quebras não testadas nesta fase.

**DAST (varredura dinâmica) — pendência registrada.** O plano prevê OWASP ZAP. Optou-se por **não** executá-lo contra o `vite preview` local, porque o *baseline* mediria os cabeçalhos do servidor de preview — não do host de produção (que define CSP, HSTS, etc.) —, resultado não representativo. Numa arquitetura SPA + BaaS sem SSR, a superfície de ataque relevante é a **API do serviço gerenciado**, já coberta com profundidade pela suíte de RLS/triggers (M-06…M-13). O DAST fica como **pendência a executar contra a URL de produção** quando houver *deploy*, registrando-se aqui a decisão e sua justificativa.

**Síntese da categoria Segurança.** Autorização no banco (RLS/triggers): **atende** após correção dos furos F-02/F-03 (0 acessos indevidos nos cenários testados). Dependências: **1 CVE de produção** a tratar (react-router-dom), demais de build. Schema: **limpo**. DAST: pendente contra produção. O núcleo da segurança de uma arquitetura BaaS — a autorização declarativa — está verificado e verde; o resíduo é um *upgrade* de dependência dirigido e uma varredura que depende de ambiente de produção.

## Semana 8 — Integração Contínua (reprodutibilidade automatizada)

Operacionaliza a exigência da Seção 5.1 — *"execuções datadas, com ambiente fixado"* — de forma automática. O workflow `.github/workflows/quality.yml` (GitHub Actions) roda a cada *push* nas branches `main`/`tcc/**` e em *pull requests*, fixando o ambiente (`node-version-file: .nvmrc`, `npm ci` sobre o *lockfile* único) e produzindo logs datados com URL citável — a prova de que os números não foram coletados à mão.

**Desenho dos *gates*:**
- **Cobertura (`npm run test:coverage`)** — *gate* rígido: falha o CI se algum limiar de `vitest.config.ts` regredir (global 30%, módulos críticos ≥75%).
- **Ciclos (`madge --circular`)** — *gate* rígido: falha se surgir dependência circular.
- **Lint** — passo **informativo** (`continue-on-error`), não bloqueia: o débito de *lint* é conhecido e rastreado (M-02/M-21), não uma regressão a barrar. Reportá-lo sem travar o *pipeline* mantém o CI verde e honesto ao mesmo tempo.

Os **testes de integração** (stack Supabase local) ficam **fora do CI** por decisão explícita: são lentos e sujeitos a instabilidade em *runner* efêmero. Rodam localmente (`npm run test:integration`) com o stack de pé; sua evidência já está versionada (M-04…M-13). Validação local dos comandos do CI antes do commit: cobertura *exit 0* (44 testes, limiares atendidos), madge 0 ciclos.
