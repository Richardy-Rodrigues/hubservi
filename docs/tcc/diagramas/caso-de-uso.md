# Diagrama de Casos de Uso

Atores: **Visitante** (não autenticado), **Cliente** e **Prestador** (perfis autenticados). O Cliente e o Prestador especializam o ator genérico Usuário Autenticado.

```mermaid
flowchart LR
    Visitante([Visitante])
    Cliente([Cliente])
    Prestador([Prestador])

    subgraph Sistema[Hubservi]
        UC1[Buscar/listar serviços]
        UC2[Ver detalhe do serviço]
        UC3[Cadastrar-se / Autenticar]
        UC4[Solicitar serviço - booking]
        UC5[Acompanhar e cancelar booking pendente]
        UC6[Avaliar serviço concluído]
        UC7[Cadastrar/editar/remover serviço]
        UC8[Gerenciar booking - aceitar/rejeitar/concluir/cancelar]
        UC9[Editar perfil]
    end

    Visitante --> UC1
    Visitante --> UC2
    Visitante --> UC3

    Cliente --> UC1
    Cliente --> UC2
    Cliente --> UC4
    Cliente --> UC5
    Cliente --> UC6
    Cliente --> UC9

    Prestador --> UC1
    Prestador --> UC2
    Prestador --> UC7
    Prestador --> UC8
    Prestador --> UC9
```

## Notas

- UC4 (solicitar) é exclusivo do Cliente; UC7 e UC8 são exclusivos do Prestador (regras impostas por RLS e *triggers*).
- UC6 (avaliar) exige booking com status `completed` no serviço (política RLS de `INSERT` em `reviews`).
- O Visitante só executa UC1, UC2 e UC3; demais casos exigem autenticação (`ProtectedRoute`).
