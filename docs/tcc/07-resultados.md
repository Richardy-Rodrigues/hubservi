# 7 Resultados

Esta seção consolida os resultados do trabalho. Os objetivos específicos 1 a 4 (delimitação, modelagem, documentação e definição de cenários) foram concluídos e são reportados em 7.1–7.2. Os objetivos 5 a 9 (execução de testes automatizados, análise estática, testes de segurança e de desempenho, e análise) foram **executados** em julho de 2026: as medições são apresentadas em 7.3, e a síntese por atributo de qualidade em 7.4. As evidências de execução correspondentes estão no [Apêndice C](apendice-c-evidencias.md).

Todos os valores quantitativos aqui reportados derivam de execuções registradas de forma reprodutível em `docs/tcc/medicoes/`, onde cada medição remete a uma ferramenta e versão, ao ambiente, à data e a um arquivo de evidência (conforme a Seção 5.1). Nenhum número é apresentado sem evidência correspondente.

## 7.1 Definição e delimitação do estudo

- **Foco redefinido:** o trabalho foi reorientado da temática de recomendação para a **avaliação técnica da arquitetura de software**, mantendo o Hubservi como objeto de estudo. A recomendação permanece como módulo secundário (ordenação por popularidade/avaliação).
- **Objeto vs. instrumento (Seção 1.5):** o objeto de pesquisa é a avaliação; o Hubservi é o instrumento, desenvolvido pela equipe como pré-requisito metodológico — condição para o acesso irrestrito ao código, ao esquema e ao ambiente que a avaliação exige.
- **Modelo arquitetural consolidado:** **SPA + BaaS + Serverless**, corrigindo incoerência documental anterior que mencionava microsserviços (inexistentes no sistema real).
- **Atributos de qualidade selecionados** (ISO/IEC 25010): segurança, eficiência de desempenho, manutenibilidade (com ênfase em testabilidade) e confiabilidade.
- **Metodologia definida:** pesquisa aplicada, abordagem mista, objetivos exploratório-descritivos, estudo de caso com experimento técnico.

## 7.2 Modelagem e documentação da arquitetura (produtos)

Foram produzidos e estão disponíveis em `docs/tcc/`:

- Descrição técnica completa da arquitetura, componentes, fluxos, persistência e regras de negócio (Seção 4);
- Modelos UML — casos de uso, classes, sequência (autenticação, contratação e avaliação), componentes e implantação;
- Modelo de processos de negócio (BPMN) para contratação e gerenciamento de booking;
- Modelo de dados — DER e dicionário de dados, fiéis ao esquema real das *migrations*.

Esses artefatos atendem aos objetivos específicos 2 e 3 e fundamentam a árvore de utilidade e os cenários do ATAM (Seção 6).

## 7.3 Resultados das medições

A fase de execução configurou o ambiente reprodutível e coletou as métricas planejadas na Seção 5. O ambiente de teste de banco/API foi levantado com uma instância **Supabase local** (Docker), contra a qual os cenários de autorização e confiabilidade foram exercitados através da API real (PostgREST) — atendendo à exigência de "teste de integração contra a API" (Seção 5.2.1). Onde uma ferramenta nomeada no plano não estava disponível no ambiente, adotou-se um substituto da mesma classe, com a troca registrada: **k6 → autocannon** (teste de carga) e **Snyk → npm audit** (análise de composição de dependências).

### 7.3.1 Achado transversal de reprodutibilidade

Ao reconstruir o banco a partir apenas das *migrations* versionadas, constatou-se que **o histórico não reproduzia um sistema funcional do zero**: faltavam os *grants* de privilégios de API aos papéis `anon`/`authenticated`/`service_role` no *schema* `public`, provocando `permission denied` antes mesmo da avaliação de RLS. O sistema funciona em produção porque esses privilégios foram aplicados fora do versionamento. Corrigiu-se com uma *migration* que torna o histórico auto-suficiente, sem alterar políticas de segurança. É um resultado característico do paradigma BaaS — parte da configuração vive no serviço gerenciado e escapa ao controle de versão — e só se revela sob uma avaliação conduzida em ambiente limpo e reprodutível.

### 7.3.2 Segurança

Os cenários de autorização foram automatizados como testes de integração por papel. **Dois defeitos reais de autorização foram detectados, corrigidos e re-medidos** (padrão medir → detectar → corrigir → re-medir):

- **Exposição de PII a usuário autenticado:** a política de leitura de `profiles` (`USING (auth.uid() IS NOT NULL)`) permitia que qualquer usuário autenticado lesse `email`/`phone` de todos os perfis. Corrigido restringindo a leitura direta ao próprio registro; dados de contraparte seguem pela *view* `public_profiles` (sem PII).
- **Avaliação atribuída a prestador incorreto:** a política de inserção de *reviews* não validava que `provider_id` corresponde ao dono do serviço — assimetria em relação aos *bookings*, que já possuíam esse *trigger*. Corrigido com *trigger* de validação espelhado.

Após as correções, a suíte de segurança (isolamento de perfis, serviços e *bookings*; bloqueio de escalonamento de `user_type`; regras de *review*) passa integralmente — **0 acessos indevidos nos cenários testados**. A análise de composição de dependências (`npm audit`) reportou 12 vulnerabilidades de severidade alta, das quais **apenas uma é de produção** (`react-router-dom`, *XSS via open redirect*, com correção disponível); as demais são ferramentas de *build*/desenvolvimento, sem superfície de ataque em produção. O `supabase db lint` não acusou erros de *schema*. A varredura dinâmica (DAST/OWASP ZAP) fica pendente para execução contra a URL de produção, por depender do ambiente de *hosting* real.

### 7.3.3 Confiabilidade

Verificados por testes de integração: a **máquina de estados do *booking*** rejeita transições inválidas (0 transições inválidas aceitas); a **integridade referencial** em exclusão de serviço não deixa registros órfãos (cascata); e o **fluxo crítico ponta a ponta** (autenticação → serviço → *booking* → avaliação) completa com sucesso no caso válido. Atende aos critérios da Seção 5.2.5.

### 7.3.4 Testabilidade

A suíte automatizada foi ampliada de 11 para **44 testes unitários/de componente** (mais 30 testes de integração). A **cobertura de linhas subiu de 18,0% para 32,0%** no agregado, concentrada nos módulos críticos, que passaram a **82–100%** (contexto de autenticação, formulários, camada de acesso a dados, *schemas* de validação). Definiu-se o limiar antes em aberto (Seção 5.2.3): piso global anti-regressão e piso ≥75% nos módulos críticos, enumerados nominalmente e verificados automaticamente. Introduziu-se uma *factory* de *mock* compartilhada, reduzindo o esforço de escrever novos testes — evidência de que a testabilidade da arquitetura, atributo sob avaliação, melhorou.

### 7.3.5 Eficiência de desempenho

Distinguem-se duas camadas:

- **Backend sob carga (atende):** a listagem de serviços respondeu, sob 30 conexões concorrentes por 20 s, com **latência p95 de 253 ms** (critério ≤ 800 ms) e **0% de erro** em ~44 mil requisições.
- **Frontend / carregamento inicial (não atende):** o Lighthouse (mediana de 3 execuções) registrou *performance score* 85 e **LCP de 3,49 s** (critérios ≥ 90 e ≤ 2,5 s). Diagnosticado *bundle* único de 679 KB com rotas carregadas de forma *eager*; aplicou-se *code-splitting* por rota, reduzindo o *bundle* inicial em 28% e melhorando os índices (score 88, LCP 3,17 s), que **permanecem abaixo da meta**. O contraste entre a API rápida e o carregamento lento localiza o gargalo de desempenho no *frontend* (peso do *bundle*), não no *backend*.

### 7.3.6 Manutenibilidade

A **modularização é sólida**: **0 dependências circulares**, confirmado por duas ferramentas independentes (Madge e dependency-cruiser), com grafo de acoplamento saudável (núcleo estável, folhas voláteis). A **higiene de código está abaixo do ideal**: o *lint* não está zerado (19 violações na configuração atual; 25 sob configuração recomendada, incluindo funções com complexidade ciclomática elevada), e a **duplicação na camada de interface é 4,55%** (acima da meta de 3%), com causa localizada — os dois *dashboards* (cliente e prestador) compartilham 61 linhas quase idênticas.

## 7.4 Síntese dos resultados

A avaliação técnica foi conduzida de ponta a ponta sobre um ambiente reprodutível, e emite verdictos **por atributo e por camada**, em vez de um juízo único:

| Atributo (ISO/IEC 25010) | Resultado |
|--------------------------|-----------|
| Segurança | Autorização declarativa (RLS/*triggers*) **atende** após correção de dois defeitos reais; 1 CVE de produção a tratar; DAST pendente contra produção |
| Confiabilidade | **Atende** (máquina de estados, integridade referencial, fluxo crítico) |
| Testabilidade | **Evoluiu** (cobertura 18%→32%; módulos críticos 82–100%, com limiar protegido) |
| Eficiência de desempenho | *Backend* **atende** (p95 253 ms); *frontend* **não atende** (LCP 3,17 s após otimização) |
| Manutenibilidade | Estrutura **atende** (0 ciclos); higiene de código **abaixo do ideal** (lint, duplicação nos *dashboards*) |

O trabalho responde à questão de pesquisa demonstrando um **procedimento reprodutível de avaliação técnica** aplicável a arquiteturas BaaS/Serverless: modelagem fiel, cenários derivados dos atributos de qualidade, medição instrumentada com registro de evidências e o ciclo de detecção e correção de defeitos. O resultado não é um atestado de que o sistema é uniformemente bom — três defeitos reais foram encontrados e o desempenho de *frontend* não atinge a meta —, e é justamente essa capacidade de **localizar deficiências com precisão** que evidencia o valor do método. A reprodutibilidade é assegurada pelo registro em `docs/tcc/medicoes/` e pela integração contínua, que executa os *gates* automatizados a cada alteração.
