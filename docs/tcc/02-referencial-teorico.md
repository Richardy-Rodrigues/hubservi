# 2 Referencial teórico

Esta seção fundamenta teoricamente o trabalho em quatro eixos: (i) arquitetura de software e atributos de qualidade; (ii) avaliação arquitetural e o método ATAM; (iii) qualidade de software segundo a ISO/IEC 25010; e (iv) o paradigma de arquiteturas BaaS/Serverless. Encerra com a contribuição da Engenharia de Software no que tange a testes e análise estática.

## 2.1 Arquitetura de software e atributos de qualidade

A arquitetura de software de um sistema é definida por Bass, Clements e Kazman (2012) como o conjunto de estruturas necessárias para raciocinar sobre o sistema, compreendendo elementos de software, as relações entre eles e as propriedades de ambos. Para os autores, a arquitetura é o artefato que viabiliza ou inibe os atributos de qualidade do sistema: decisões arquiteturais — e não primariamente decisões de implementação — determinam o grau em que requisitos como desempenho, segurança e modificabilidade serão satisfeitos.

Bass, Clements e Kazman (2012) distinguem requisitos funcionais, que expressam *o que* o sistema deve fazer, dos *requisitos de atributos de qualidade*, que expressam *quão bem* o sistema deve fazê-lo. Esses requisitos são expressos por meio de **cenários de atributos de qualidade**, estruturados em seis partes: fonte do estímulo, estímulo, artefato, ambiente, resposta e medida da resposta. Tal estrutura é central para este trabalho, pois fornece o formato pelo qual os atributos avaliados na plataforma Hubservi serão operacionalizados como cenários verificáveis (Seções 5 e 6).

Os autores também introduzem o conceito de **táticas** — decisões de projeto que influenciam o controle de um atributo de qualidade — e de **ASR** (*Architecturally Significant Requirements*), os requisitos cuja satisfação depende de decisões arquiteturais. No contexto de uma arquitetura BaaS/Serverless, táticas de segurança como *autenticar atores* e *autorizar atores* materializam-se em mecanismos declarativos (autenticação gerenciada e políticas de RLS), o que justifica avaliá-las de forma específica.

## 2.2 Avaliação arquitetural e o método ATAM

Clements, Kazman e Klein (2002), em *Evaluating Software Architectures*, argumentam que a arquitetura, por ser o primeiro artefato em que os atributos de qualidade do sistema se tornam analisáveis, pode e deve ser avaliada antes de a construção avançar, reduzindo o risco de retrabalho. Os autores propõem o **ATAM** (*Architecture Tradeoff Analysis Method*), método de avaliação baseado em cenários cujo objetivo não é fornecer notas precisas, mas identificar **riscos**, **pontos de sensibilidade** (*sensitivity points*) e **pontos de compromisso** (*tradeoff points*) decorrentes das decisões arquiteturais.

O ATAM organiza-se em torno de uma **árvore de utilidade** (*utility tree*), que decompõe a "utilidade" geral do sistema em atributos de qualidade, estes em refinamentos, e estes, por fim, em cenários priorizados segundo a importância para o negócio e o grau de risco arquitetural. Os principais conceitos do método, mobilizados na Seção 6, são:

- **Ponto de sensibilidade:** propriedade de um ou mais componentes da arquitetura que é crítica para se alcançar uma resposta de atributo de qualidade.
- **Ponto de compromisso:** propriedade que é ponto de sensibilidade para mais de um atributo, de modo que melhorá-la para um atributo pode degradar outro.
- **Risco e não risco:** decisões arquiteturais com consequências potencialmente negativas (ou explicitamente seguras) para os atributos de qualidade.

O método é especialmente adequado a este trabalho por ser orientado a cenários e por focalizar *tradeoffs*, dimensão central em arquiteturas BaaS/Serverless, nas quais a delegação de responsabilidades a serviços gerenciados implica compromissos explícitos entre simplicidade, controle, desempenho e segurança.

## 2.3 Qualidade de software e a norma ISO/IEC 25010

A norma ISO/IEC 25010 (2011), parte da família SQuaRE (*Systems and software Quality Requirements and Evaluation*), define um **modelo de qualidade do produto de software** composto por oito características, cada qual subdividida em subcaracterísticas. As características são: adequação funcional, eficiência de desempenho, compatibilidade, usabilidade, confiabilidade, segurança, manutenibilidade e portabilidade.

Para o escopo deste trabalho, são mobilizadas as seguintes características e subcaracterísticas:

- **Segurança** (*security*): confidencialidade, integridade, não repúdio, responsabilização (*accountability*) e autenticidade. Avaliada por meio de autenticação, autorização e controle de acesso indevido.
- **Eficiência de desempenho** (*performance efficiency*): comportamento temporal, utilização de recursos e capacidade. Avaliada por tempo de resposta, tempo de carregamento e comportamento sob carga.
- **Manutenibilidade** (*maintainability*): modularidade, reusabilidade, analisabilidade, modificabilidade e **testabilidade**. Cabe registrar que, na ISO/IEC 25010 (2011), a *testabilidade* é uma subcaracterística da manutenibilidade; neste trabalho ela é tratada como dimensão avaliativa destacada, em razão de sua centralidade para a verificação dos demais atributos.
- **Confiabilidade** (*reliability*): maturidade, disponibilidade, tolerância a falhas e recuperabilidade. Avaliada pela consistência de operações e pelo comportamento em fluxos críticos.

A norma fornece, assim, o vocabulário e a taxonomia que estruturam o plano de métricas (Seção 5), garantindo rastreabilidade entre cada métrica coletada e a característica de qualidade que ela pretende evidenciar.

## 2.4 Arquiteturas BaaS e Serverless

O termo *serverless* designa um modelo de execução no qual a provisão, o escalonamento e a manutenção de servidores são abstraídos e delegados a um provedor, de modo que a equipe de desenvolvimento concentra-se na lógica da aplicação. Uma de suas manifestações é o *Backend as a Service* (BaaS), no qual funcionalidades de *backend* comumente necessárias — autenticação, banco de dados, armazenamento de arquivos e autorização — são oferecidas como serviços gerenciados, consumidos diretamente pelo cliente por meio de SDKs e APIs.

Nesse arranjo, parte significativa das regras de negócio e, sobretudo, das regras de autorização desloca-se para a camada de dados. No caso do Supabase, isso se concretiza por meio do *Row Level Security* (RLS) do PostgreSQL, mecanismo que permite definir, de forma **declarativa**, políticas que restringem quais linhas cada usuário pode ler ou modificar, avaliadas pelo próprio banco a cada operação. Complementam o modelo as *views* (que expõem projeções controladas dos dados) e os *triggers* (que aplicam regras de integridade e máquinas de estado no servidor).

Do ponto de vista arquitetural, esse paradigma apresenta implicações relevantes para a avaliação de qualidade:

- A **superfície de autorização** concentra-se em políticas declarativas, cuja correção precisa ser testada explicitamente, pois falhas de RLS podem expor dados sem que haja erro funcional aparente no cliente.
- A **ausência de servidor de aplicação próprio** transfere parte do desempenho percebido para o cliente (carregamento da SPA) e para a latência das chamadas ao serviço gerenciado.
- A **testabilidade** passa a depender da capacidade de testar tanto o cliente quanto as regras residentes no banco.

Essas implicações motivam a necessidade, identificada no problema de pesquisa, de um procedimento de avaliação técnica específico para arquiteturas BaaS/Serverless.

## 2.5 Engenharia de software: testes e análise estática

Pressman e Maxim (2016) sistematizam o teste de software como atividade planejada e mensurável, distinguindo níveis (unidade, integração, sistema) e abordagens (caixa-branca e caixa-preta), e enfatizam o papel das métricas de software na avaliação objetiva da qualidade de produto e de processo. Sommerville (2011), por sua vez, situa a verificação e a validação, a análise estática e a inspeção de código como práticas complementares ao teste dinâmico, destacando que a análise estática permite detectar classes de defeitos — e indicadores de manutenibilidade, como complexidade e duplicação — sem a execução do programa.

Esses referenciais embasam a escolha das ferramentas e métricas do plano experimental (Seção 5): testes automatizados (de unidade e de integração) para adequação funcional, confiabilidade e testabilidade; análise estática para manutenibilidade; e técnicas específicas para os atributos de segurança e desempenho.
