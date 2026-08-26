# 3 Metodologia

## 3.1 Classificação da pesquisa

A pesquisa é classificada segundo quatro dimensões usuais na metodologia científica: natureza, abordagem, objetivos e procedimentos técnicos.

| Dimensão | Classificação | Justificativa |
|----------|---------------|---------------|
| **Natureza** | Aplicada | Visa gerar conhecimento de aplicação prática — um procedimento de avaliação técnica — dirigido à solução de um problema concreto de validação arquitetural. |
| **Abordagem** | Mista (quantitativa e qualitativa) | Combina a coleta de métricas objetivas (cobertura, tempos de resposta, complexidade, vulnerabilidades) com a análise qualitativa de decisões arquiteturais via ATAM. |
| **Objetivos** | Exploratória e descritiva | Explora a aplicação de métodos de avaliação a um paradigma arquitetural pouco coberto pela literatura clássica (BaaS/Serverless) e descreve detalhadamente a arquitetura e os resultados da avaliação. |
| **Procedimentos** | Estudo de caso com experimento técnico | Investiga em profundidade um caso real (Hubservi) e conduz um experimento técnico controlado de coleta de métricas e execução de testes. |

## 3.2 Objeto de estudo

O objeto de estudo é a plataforma **Hubservi**, aplicação web de intermediação de serviços construída como SPA em React e TypeScript e apoiada pelo BaaS Supabase sobre PostgreSQL. A escolha justifica-se por ser um caso representativo do paradigma SPA + BaaS + Serverless, com regras de negócio expressivas residentes no banco (políticas de RLS, *triggers* e *views*), o que a torna adequada à investigação do problema de pesquisa. A arquitetura do objeto é detalhada na Seção 4.

### 3.2.1 Construção do instrumento

Conforme a delimitação da Seção 1.5, a plataforma é o **instrumento** da avaliação, desenvolvido integralmente pela equipe. Sua construção seguiu um processo estruturado, guiado por artefatos de Engenharia de Software, e não é objeto de avaliação em si — registra-se aqui por dois motivos: a **validade interna** do experimento depende de o instrumento ser conhecido e controlado, e parte desses artefatos alimenta diretamente as etapas seguintes da pesquisa.

- **Iniciação e concepção:** Termo de Abertura do Projeto (TAP), Modelo Canvas e análise SWOT delimitaram problema, escopo (MVP), premissas, restrições e critérios de sucesso.
- **Planejamento:** Estrutura Analítica do Projeto (EAP) e 5W2H organizaram as entregas; os requisitos foram especificados e priorizados sob identificadores rastreáveis (**RF-xx** funcionais, **RNF-xx** não funcionais).
- **Modelagem:** UML (casos de uso, classes, componentes, sequência e implantação), BPMN (contratação e gerenciamento de *booking*) e modelo de dados (DER e dicionário de dados).
- **Construção incremental:** entrega por marcos — **M1** requisitos e arquitetura; **M2** fluxos centrais (autenticação, serviços, *booking*); **M3** segurança e governança de dados (RLS e *triggers*); **M4** validação de qualidade; **M5** evolução da descoberta de serviços (ordenação e filtros).
- **Fluxo de qualidade contínuo:** *lint*, testes e revisão a cada alteração, conforme premissa registrada no TAP.

Os artefatos de modelagem, além de documentarem o instrumento, **atendem aos objetivos específicos 2 e 3** e constituem a base a partir da qual se derivam a árvore de utilidade do ATAM (Seção 6) e os cenários de avaliação (Seção 5) — ou seja, ligam a construção do instrumento à avaliação propriamente dita. Encontram-se em `docs/tcc/diagramas/`.

## 3.3 Etapas metodológicas

A condução do trabalho organiza-se em seis etapas, alinhadas aos objetivos específicos (Seção 1.4.2):

1. **Levantamento de requisitos arquiteturais e atributos de qualidade.** Identificação dos *Architecturally Significant Requirements* (ASR) e seleção das características de qualidade da ISO/IEC 25010 (2011) relevantes ao domínio: segurança, eficiência de desempenho, manutenibilidade (com ênfase em testabilidade) e confiabilidade.

2. **Modelagem da arquitetura.** Recuperação e representação da arquitetura real a partir do código-fonte e das *migrations*, produzindo modelos UML (casos de uso, classes, sequência, componentes e implantação), modelo de processos de negócio (BPMN) e o modelo de dados (DER e dicionário de dados). Os artefatos encontram-se em `docs/tcc/diagramas/`.

3. **Documentação técnica.** Descrição dos componentes, fluxos, persistência e regras de negócio (Seção 4), assegurando rastreabilidade entre cada afirmação e sua fonte no repositório.

4. **Definição de cenários de avaliação.** Construção de uma árvore de utilidade ATAM e especificação de cenários de atributo de qualidade no formato de seis partes (Seção 6), além do mapeamento atributo → cenário → métrica → critério → ferramenta (Seção 5).

5. **Execução da avaliação técnica.** Execução de testes automatizados (unitários, de componente e de integração contra a API), análise estática de código, testes de segurança e testes de desempenho, conforme o plano de métricas. O ambiente de teste de banco/API foi levantado com uma instância Supabase local, garantindo reprodutibilidade e isolamento em relação a dados de produção.

6. **Análise dos resultados.** Interpretação das métricas coletadas à luz dos critérios definidos e dos *tradeoffs* identificados no ATAM, com discussão dos achados e recomendações (Seção 7).

## 3.4 Instrumentos e ferramentas

A coleta de dados apoia-se em um conjunto de ferramentas, organizado por atributo de qualidade e detalhado na Seção 5. Onde a ferramenta inicialmente prevista não estava disponível no ambiente (por exigir conta ou instalação indisponível), adotou-se um substituto **da mesma classe**, medindo as mesmas métricas; cada substituição está registrada em `docs/tcc/medicoes/`.

- **Testes automatizados:** Vitest e React Testing Library (unitários e de componente); Vitest contra o *stack* Supabase local via PostgREST (integração).
- **Análise estática:** ESLint; `eslint-plugin-sonarjs` para *code smells* e complexidade — em substituição ao SonarQube, que exige serviço externo; `jscpd` para duplicação.
- **Análise de dependências e modularização:** Madge e dependency-cruiser.
- **Desempenho:** Lighthouse (carregamento inicial); autocannon (carga sobre a API) — em substituição ao k6/JMeter.
- **Segurança:** `npm audit` para análise de composição de dependências (SCA) — em substituição ao Snyk, que exige conta; `supabase db lint` para o *schema*. A varredura dinâmica (DAST/OWASP ZAP) permanece pendente de execução contra a URL de produção.

## 3.5 Procedimentos de análise

As métricas quantitativas são confrontadas com os critérios de aceitação previamente definidos (limiares e metas), e os achados qualitativos organizados segundo os conceitos do ATAM (riscos, pontos de sensibilidade e pontos de compromisso). A triangulação entre as evidências quantitativas e a análise arquitetural qualitativa sustenta a resposta à questão de pesquisa.

Adotou-se, na execução, o ciclo **medir → detectar → corrigir → re-medir**: quando uma medição reprova o sistema, o defeito é corrigido e a medição repetida, reportando-se o par antes/depois. Um conjunto de cenários que aprovasse o sistema já na primeira execução não demonstraria qualidade, e sim fraqueza dos cenários — por isso os dois estados são preservados como evidência.

> **Regra de registro e anti-fabricação.** Toda medição registra ferramenta e versão, ambiente, configuração, data, valor obtido e veredito, com o artefato bruto correspondente arquivado em `docs/tcc/medicoes/evidencias/`. Nenhum valor é reportado sem evidência associada, e os resultados desfavoráveis são registrados com o mesmo rigor que os favoráveis (Seção 7).
