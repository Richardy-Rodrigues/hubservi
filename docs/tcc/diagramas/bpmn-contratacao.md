# BPMN — Contratação de serviço

Processo de negócio da contratação, das raias Cliente e Prestador, mediado pelo sistema. Notação BPMN aproximada em Mermaid (`flowchart`).

```mermaid
flowchart TD
    Start([Início: cliente busca serviço]) --> Buscar[Buscar/filtrar serviços]
    Buscar --> Ver[Abrir detalhe do serviço]
    Ver --> Logado{Autenticado<br/>como cliente?}
    Logado -- Não --> Auth[Autenticar/Cadastrar] --> Ver
    Logado -- Sim --> Solicitar[Preencher solicitação<br/>mensagem + data]
    Solicitar --> Criar[/Sistema cria booking<br/>status = pending/]
    Criar --> Notifica[Prestador visualiza solicitação]
    Notifica --> Decisao{Prestador decide}
    Decisao -- Aceita --> Aceito[/status = accepted/]
    Decisao -- Rejeita --> Rejeitado[/status = rejected/]
    Decisao -- Sem resposta --> Cancelar{Cliente cancela<br/>pendente?}
    Cancelar -- Sim --> Cancelado[/status = cancelled/]
    Cancelar -- Não --> Notifica
    Aceito --> Executa[Serviço é executado]
    Executa --> Concluir[/Prestador conclui<br/>status = completed/]
    Concluir --> Avaliar[Cliente pode avaliar]
    Avaliar --> End([Fim])
    Rejeitado --> End
    Cancelado --> End
```

## Notas

- A criação do booking e as mudanças de status são validadas no banco (RLS + *triggers*).
- A avaliação só é habilitada após `status = completed` (ver [sequência — avaliação](sequencia-avaliacao.md)).
