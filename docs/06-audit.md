# 06 — Auditoria do App (snapshot 2026-05-14)

Auditoria completa do Hubservi aplicando as 5 skills em [.github/skills/](../.github/skills/) e cruzando com os docs 01-05. Escopo: somente leitura — sem alteracoes em codigo, migrations ou docs existentes. Diagramas referenciados em [docs/diagrams/](./diagrams/) sem reembutir conteudo.

## 1. Resumo executivo

| Area | Status | Justificativa curta |
| --- | --- | --- |
| Auth (signup/login) | 🟢 Verde | Zod + Supabase Auth + trigger `handle_new_user` idempotente. |
| ProtectedRoute / Routing | 🟢 Verde | Loader, redirect e estrutura coerente com [docs/02-architecture.md](./02-architecture.md). |
| Services (CRUD + listagem) | 🟡 Amarelo | CRUD funciona, mas ordenacao por rating/popular esta quebrada e falta validar `price_max >= price_min`. |
| Booking (fluxo completo) | 🟡 Amarelo | UI cobre todas as transicoes, mas `provider_id` nao tem amarra com `services.provider_id` no banco. |
| Reviews | 🟡 Amarelo | Leitura entregue; **falta UI de criacao de review**. |
| Dashboard role-based | 🟢 Verde | Selecao por `profile.user_type` correta; KPIs adequados (avg rating ainda placeholder). |
| RLS / Triggers | 🔴 Vermelho | Policy `Users can update own profile` permite auto-promocao a provider. Profiles publicos expoem PII (email, phone). |
| Testes | 🔴 Vermelho | Cobertura zero efetiva — so existe [src/test/example.test.ts](../src/test/example.test.ts) com `expect(true).toBe(true)`. |
| Sync de docs | 🟢 Verde | docs 01-05 condizem com codigo; pequeno drift de marca ("ServiHub" em [Auth.tsx](../src/pages/Auth.tsx)). |

## 2. Inventario do entregue

Cobertura das funcionalidades anunciadas em [docs/01-overview.md](./01-overview.md) e [docs/03-business-rules.md](./03-business-rules.md):

| Feature anunciada | Status | Evidencia |
| --- | --- | --- |
| Cadastro/login com client ou provider | ✅ Entregue | [src/pages/Auth.tsx:14-101](../src/pages/Auth.tsx#L14-L101) + trigger em [supabase/migrations/20260316201000_fix_profiles_sync_and_backfill.sql:19-49](../supabase/migrations/20260316201000_fix_profiles_sync_and_backfill.sql#L19-L49) |
| Listagem publica de servicos ativos | ✅ Entregue | [src/pages/Services.tsx:33-86](../src/pages/Services.tsx#L33-L86) |
| Detalhe de servico + acao de solicitacao | ✅ Entregue | [src/pages/ServiceDetail.tsx:19-72](../src/pages/ServiceDetail.tsx#L19-L72) + [src/components/BookingDialog.tsx](../src/components/BookingDialog.tsx) |
| Dashboard protegido por papel | ✅ Entregue | [src/pages/Dashboard.tsx:7-22](../src/pages/Dashboard.tsx#L7-L22) + [src/components/ProtectedRoute.tsx](../src/components/ProtectedRoute.tsx) |
| Gestao de servicos (provider) | ✅ Entregue | [src/components/dashboard/ProviderDashboard.tsx:48-91](../src/components/dashboard/ProviderDashboard.tsx#L48-L91) + [src/components/dashboard/ServiceForm.tsx](../src/components/dashboard/ServiceForm.tsx) |
| Gestao de bookings (client e provider) | ✅ Entregue | [ClientDashboard.tsx:22-38](../src/components/dashboard/ClientDashboard.tsx#L22-L38) + [ProviderDashboard.tsx:62-77](../src/components/dashboard/ProviderDashboard.tsx#L62-L77) |
| Transicoes de status validadas | ✅ Entregue | Trigger em [migration 20260303232457:170-185](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L170-L185) |
| Reviews (leitura + estatisticas) | ✅ Entregue | [ServiceDetail.tsx:44-56,144-181](../src/pages/ServiceDetail.tsx#L44-L56) + view `service_stats` em [migration 20260303232514](../supabase/migrations/20260303232514_c1556914-0a0b-46ec-9cc9-6691562509cf.sql) |
| Reviews (criacao pelo cliente) | ❌ **Nao entregue** | Tabela e policy `Clients can create reviews` existem, mas nao ha componente. Nenhum match em `src/components/**/*review*.tsx`. |
| Validacao `price_max >= price_min` | ❌ **Nao entregue** | Zod schema em [ServiceForm.tsx:16-25](../src/components/dashboard/ServiceForm.tsx#L16-L25) nao tem refinement cruzado; sem `CHECK` no banco. |
| Coerencia `bookings.provider_id = services.provider_id` | ❌ **Nao entregue** | Sem `CHECK`/trigger. Reconhecido em [docs/04-data-and-security.md:90-94](./04-data-and-security.md#L90-L94). |
| Endurecimento de profile (campos sensiveis) | ❌ **Nao entregue** | Policy em [migration 20260303232457:21](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L21) nao restringe colunas. |
| Cobertura de testes minima | ❌ **Nao entregue** | So [src/test/example.test.ts](../src/test/example.test.ts). |
| Suite de diagramas | ✅ Entregue | [docs/diagrams/](./diagrams/) (8 diagramas + README). |

## 3. Validacao por skill

### 3.1 feature-guardrails

**Conformidades**
- Ownership preservado em services: policies INSERT/UPDATE/DELETE checam `auth.uid() = provider_id` ([migration 20260303232457:54-56](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L54-L56)) e o frontend injeta `provider_id: user!.id` ao salvar ([ServiceForm.tsx:86](../src/components/dashboard/ServiceForm.tsx#L86)).
- Booking respeita papel: BookingDialog oculta o botao para provider/proprio-servico ([BookingDialog.tsx:42-48](../src/components/BookingDialog.tsx#L42-L48)).
- Transicoes de status validadas no banco + UI que so oferece transicoes legitimas ([ProviderDashboard.tsx:232-270](../src/components/dashboard/ProviderDashboard.tsx#L232-L270)).

**Achados**
- O guardrail "Any change to profile handling must avoid privilege escalation through user_type" esta violado: a policy `Users can update own profile` permite o cliente fazer `UPDATE profiles SET user_type='provider' WHERE id = auth.uid()` direto via API.
- O guardrail "Booking flow must respect status transition rules" esta protegido no banco, mas a UI permite o provider cancelar `accepted -> cancelled` sem motivo, regra que [docs/03-business-rules.md:21](./03-business-rules.md#L21) lista como permitida — OK, mas falta `reason` registrado.

### 3.2 pre-merge-review

**Achados**
- **Auth fluxo**: redirecionamento pos-signup depende do `useEffect` no `Auth.tsx` ([Auth.tsx:42-44](../src/pages/Auth.tsx#L42-L44)); se a sessao demorar para hidratar, o usuario fica preso ate o toast. Aceitavel, mas suscetivel a flake em integracao futura.
- **Services regression**: a clausula `if (sort === "recent") ... else ...` em [Services.tsx:52-56](../src/pages/Services.tsx#L52-L56) ordena identicamente nos dois ramos. O sort por `rating`/`popular` so e aplicado em memoria sobre a pagina atual ([Services.tsx:78-82](../src/pages/Services.tsx#L78-L82)), entao paginas alem da primeira retornam ordem incorreta — **regressao silenciosa**.
- **Dashboard provider**: KPI `avgRating` codado como `"—"` ([ProviderDashboard.tsx:98](../src/components/dashboard/ProviderDashboard.tsx#L98)). O dado existe na view `service_stats` mas nao e agregado para o provider.
- **ServiceDetail**: similares renderizam rating mascarado por `const sr = 0` ([ServiceDetail.tsx:230](../src/pages/ServiceDetail.tsx#L230)) — codigo morto que sempre oculta o bloco; nao quebra, mas e ruido.
- **Auth marca**: titulo "Bem-vindo ao ServiHub" em [Auth.tsx:108](../src/pages/Auth.tsx#L108) diverge do nome oficial *Hubservi* nos docs.

### 3.3 supabase-safe-migration

**Conformidades**
- RLS habilitado em `profiles`, `categories`, `services`, `bookings`, `reviews` desde [migration 20260303232457](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql).
- Trigger `validate_booking_status_transition` cobre todas as transicoes legitimas.
- View `service_stats` foi reforcada com `security_invoker = true` em [migration 20260303232514](../supabase/migrations/20260303232514_c1556914-0a0b-46ec-9cc9-6691562509cf.sql).
- Migration corretiva `20260316201000` torna a sincronizacao de profiles idempotente e faz backfill seguro.

**Achados criticos**
- 🔴 **Self-promotion via UPDATE**: nada impede `UPDATE profiles SET user_type='provider'` ([migration 20260303232457:21](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L21)). Falta `WITH CHECK` por coluna, gatilho `BEFORE UPDATE OF user_type` ou separar policy.
- 🔴 **Cross-ownership em bookings**: cliente pode inserir `bookings` com `provider_id` arbitrario; RLS so testa `auth.uid() = client_id` ([migration 20260303232457:79](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L79)). Hoje o frontend envia o `provider_id` correto via [BookingDialog.tsx:56-62](../src/components/BookingDialog.tsx#L56-L62), mas a regra existe so no cliente.
- 🟠 **PII publica**: `Public profiles are viewable USING (true)` ([migration 20260303232457:22](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L22)) permite leitura de `email`, `phone` etc. para qualquer um. `ServiceDetail.tsx` chega a selecionar `email` do provider ([ServiceDetail.tsx:27](../src/pages/ServiceDetail.tsx#L27)).
- 🟠 **Sem CHECK de preco**: a constraint `price_max >= price_min OR price_max IS NULL` esta apenas implicita.
- 🟡 **Reviews sem amarra com booking**: a policy `Clients can create reviews` ([migration 20260303232457:100](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L100)) nao exige booking `completed`. Cliente pode avaliar sem ter contratado.

### 3.4 test-safety-net

**Status atual**: 🔴 cobertura efetiva = 0%. O unico teste e [src/test/example.test.ts:1-7](../src/test/example.test.ts#L1-L7) com `expect(true).toBe(true)`.

**Areas "priority test targets" da skill (todas descobertas):**
- AuthContext + ProtectedRoute (acesso ao dashboard sem sessao).
- BookingDialog (3 guard clauses + sucesso/erro do INSERT).
- ServiceForm (Zod schema, edicao vs criacao, ramos de submit).
- Dashboards (renderizacao condicional por `user_type`).

**Inputs ja prontos para escrever testes**: Vitest + Testing Library + jsdom estao instalados em [package.json:68-89](../package.json#L68-L89).

### 3.5 docs-sync

**Conformidades**
- Comandos em [docs/05-development-and-quality.md:16-22](./05-development-and-quality.md#L16-L22) batem com `package.json` (dev, build, build:dev, preview, lint, test, test:watch).
- Tabelas e enums citados em [docs/04-data-and-security.md](./04-data-and-security.md) batem com as migrations.
- Trigger e policies do fix `20260316201000` ja documentados em [docs/04-data-and-security.md:33-37](./04-data-and-security.md#L33-L37).

**Drift detectado**
- Marca "ServiHub" no UI ([Auth.tsx:108](../src/pages/Auth.tsx#L108)) vs "Hubservi" nos docs.
- Lacunas reconhecidas em [docs/05:38-41](./05-development-and-quality.md#L38-L41) (cobertura de testes) e [docs/04:90-94](./04-data-and-security.md#L90-L94) (hardening) ainda nao tem registro de plano/owner.

## 4. Riscos por severidade

### 🔴 Critico

1. **Auto-promocao de cliente para provider** via `UPDATE profiles SET user_type='provider'`. Local: [migration 20260303232457:21](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L21).
2. **Booking com provider_id arbitrario** burlando ownership de service. Local: politicas em [migration 20260303232457:77-80](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L77-L80).

### 🟠 Alto

3. **Vazamento de PII** via `Public profiles are viewable` cobrindo `email` e `phone`. Local: [migration 20260303232457:22](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L22).
4. **Sort por rating/popular incorreto em paginas seguintes**. Local: [Services.tsx:78-82](../src/pages/Services.tsx#L78-L82).
5. **`price_max < price_min` aceito**. Local: [ServiceForm.tsx:16-25](../src/components/dashboard/ServiceForm.tsx#L16-L25) + schema.

### 🟡 Medio

6. **Cobertura de testes zero** nos fluxos sensiveis (auth, booking, role guards).
7. **Reviews sem UI de criacao**.
8. **Reviews sem amarra com booking `completed`** — cliente pode avaliar sem ter contratado.
9. **`window.confirm` para deletar servico** em vez do `AlertDialog`. Local: [ProviderDashboard.tsx:314](../src/components/dashboard/ProviderDashboard.tsx#L314).
10. **KPI `avgRating` placeholder** no ProviderDashboard.

### 🔵 Baixo

11. **Codigo morto em similares (`const sr = 0`)** em [ServiceDetail.tsx:230](../src/pages/ServiceDetail.tsx#L230).
12. **Drift de marca** "ServiHub" vs "Hubservi" em [Auth.tsx:108](../src/pages/Auth.tsx#L108).
13. **Busca em titulo via `ilike`** nao aproveita `idx_services_title` (GIN tsvector). Local: [Services.tsx:46](../src/pages/Services.tsx#L46).

## 5. Proximos passos (backlog priorizado)

> Formato: `[P*] acao — skill — alvo — verificacao`

### P0 (bloquear merge ate resolver)

- [P0] Restringir UPDATE em `profiles` para impedir alteracao de `user_type` apos signup — **supabase-safe-migration** — alvo: nova migration sobre [profiles policy](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L21) — verificacao: como cliente, `update profiles set user_type='provider' where id=auth.uid()` deve falhar.
- [P0] Adicionar amarra `bookings.provider_id = services.provider_id` (CHECK + trigger ou WITH CHECK na policy de INSERT) — **supabase-safe-migration** + **feature-guardrails** — alvo: nova migration — verificacao: insert manual com `provider_id` arbitrario deve falhar.
- [P0] Restringir `Public profiles are viewable` a colunas nao-sensiveis (criar view publica ou policy SELECT com colunas) — **supabase-safe-migration** — alvo: [migration 20260303232457:22](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L22) + [ServiceDetail.tsx:27](../src/pages/ServiceDetail.tsx#L27) — verificacao: consulta anonima a `profiles` nao deve retornar `email`/`phone`.

### P1 (fluxos sensiveis sem rede de seguranca)

- [P1] Adicionar `CHECK (price_max IS NULL OR price_max >= price_min)` em `services` e refinement Zod equivalente — **feature-guardrails** — alvo: nova migration + [ServiceForm.tsx:16-25](../src/components/dashboard/ServiceForm.tsx#L16-L25) — verificacao: insert com `price_max=10, price_min=100` falha em ambos.
- [P1] Corrigir sort por rating/popular: ordenar via subquery em `service_stats` ou ranking server-side — **pre-merge-review** — alvo: [Services.tsx:33-86](../src/pages/Services.tsx#L33-L86) — verificacao: pagina 2 com `sort=rating` retorna registros em ordem global.
- [P1] Suite minima de testes Vitest + Testing Library — **test-safety-net** — alvos:
  - AuthContext + ProtectedRoute (redirect e loader)
  - BookingDialog (3 guards + INSERT)
  - ServiceForm (schema + ramo criar/editar)
  - Dashboard (rotear client vs provider)
  - verificacao: `npm run test` cobre os 4 alvos com pelo menos 1 caso feliz e 1 de erro.
- [P1] Endurecer policy de reviews para exigir booking `completed` do mesmo `service_id`+`client_id` — **supabase-safe-migration** — alvo: [migration 20260303232457:100](../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql#L100).

### P2 (qualidade e completude)

- [P2] UI de criacao de review em `ServiceDetail` (visivel apenas quando ha booking `completed` do cliente atual) — **feature-guardrails** — alvo: novo componente `ReviewForm` + integracao em [ServiceDetail.tsx:144-181](../src/pages/ServiceDetail.tsx#L144-L181).
- [P2] Substituir `window.confirm` por `AlertDialog` ja disponivel — **pre-merge-review** — alvo: [ProviderDashboard.tsx:314](../src/components/dashboard/ProviderDashboard.tsx#L314).
- [P2] Calcular `avgRating` no ProviderDashboard a partir de `service_stats` agregado por provider — **feature-guardrails** — alvo: [ProviderDashboard.tsx:93-99](../src/components/dashboard/ProviderDashboard.tsx#L93-L99).
- [P2] Remover codigo morto `const sr = 0` e mostrar rating real dos similares — **pre-merge-review** — alvo: [ServiceDetail.tsx:230](../src/pages/ServiceDetail.tsx#L230).
- [P2] Unificar marca para "Hubservi" — **docs-sync** — alvo: [Auth.tsx:108](../src/pages/Auth.tsx#L108).
- [P2] Trocar `ilike` por busca via tsvector aproveitando `idx_services_title` — **pre-merge-review** — alvo: [Services.tsx:46](../src/pages/Services.tsx#L46).

## 6. Apendice — diagramas relacionados

- Fluxo de booking auditado: [docs/diagrams/01-bpmn-booking.md](./diagrams/01-bpmn-booking.md) e [docs/diagrams/04-sequence-booking.md](./diagrams/04-sequence-booking.md).
- Modelo de dados base dos achados de RLS: [docs/diagrams/03-class-uml.md](./diagrams/03-class-uml.md).
- Mapa de componentes: [docs/diagrams/08-component-diagram.md](./diagrams/08-component-diagram.md).
- Visao SWOT consolidada deste audit: [docs/diagrams/06-swot.md](./diagrams/06-swot.md).
- Backlog macro alinhado a EAP: [docs/diagrams/05-eap.md](./diagrams/05-eap.md).
