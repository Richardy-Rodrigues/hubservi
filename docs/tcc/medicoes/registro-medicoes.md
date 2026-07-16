# Registro de medições

Tabela mestra de todas as medições realizadas. Cada linha remete a um arquivo de evidência em `evidencias/AAAA-MM-DD/` e ao commit em que foi coletada. Protocolo e comandos de reprodução em [README.md](README.md).

> **Estado do repositório na coleta de 2026-07-15.** As medições desta data foram coletadas sobre a árvore de trabalho no commit `ad89e6c`, com as alterações da Semana 1 já aplicadas (extração de *schemas*, configuração de cobertura, remoção dos *lockfiles* do `bun`) porém ainda não *commitadas*. O `ambiente.txt` registra o SHA de referência; ao *commitar* a fundação, esta nota deve ser substituída pelo novo SHA.

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
