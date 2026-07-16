# Registro de medições

Tabela mestra de todas as medições realizadas. Cada linha remete a um arquivo de evidência em `evidencias/AAAA-MM-DD/` e ao commit em que foi coletada. Protocolo e comandos de reprodução em [README.md](README.md).

> **Estado do repositório na coleta de 2026-07-15.** As medições desta data foram coletadas sobre a árvore de trabalho no commit `ad89e6c`, com as alterações da Semana 1 já aplicadas (extração de *schemas*, configuração de cobertura, remoção dos *lockfiles* do `bun`) porém ainda não *commitadas*. O `ambiente.txt` registra o SHA de referência; ao *commitar* a fundação, esta nota deve ser substituída pelo novo SHA.

## Baseline — Semana 1 (fundação)

Estas são as **três primeiras medições reais** do trabalho. Registram o ponto de partida antes da ampliação da suíte e da configuração das ferramentas de segurança e desempenho. Os valores são propositalmente desfavoráveis em dois dos três casos — é o retrato honesto do estado atual, e a base contra a qual o progresso será medido.

| ID | Atributo (ISO/IEC 25010) | Cenário / métrica | Ferramenta + versão | Data | Valor | Critério | Veredito | Evidência |
|----|--------------------------|-------------------|---------------------|------|-------|----------|----------|-----------|
| M-01 | Manutenibilidade → testabilidade | Cobertura de linhas da suíte (global, exclusões conforme README) | Vitest 3.2.4 + coverage-v8 3.2.7 | 2026-07-15 | **18,03%** linhas / 67,9% ramos | ≥70% módulos críticos (a calibrar na Semana 5) | **Não atende** (baseline) | `evidencias/2026-07-15/coverage-summary.json` |
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
