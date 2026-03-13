# 03 - Business Rules

## PT-BR

### Perfis de usuario
- client: navega, solicita servicos e acompanha bookings
- provider: publica servicos e gerencia bookings recebidos

### Regras de servicos
- Apenas provider autenticado cria/edita/remove seus servicos
- Listagem publica considera servicos ativos
- Campos principais: titulo, descricao, categoria, faixa de preco, localizacao, status ativo

### Regras de booking
- Apenas client autenticado cria booking
- Provider nao deve solicitar o proprio servico
- Status inicial de booking: pending
- Transicoes permitidas no banco:
  - pending -> accepted ou rejected
  - accepted -> completed ou cancelled

### Regras de review
- Cliente pode avaliar servico
- Rating entre 1 e 5
- Restricao de unicidade: 1 review por cliente por servico

### Regras de dashboard
- Se user_type for provider: ProviderDashboard
- Caso contrario: ClientDashboard

### Riscos de negocio a monitorar
- Coerencia entre provider_id do booking e provider dono do servico
- Validacao de faixa de preco (price_max >= price_min)
- Garantir que apenas atores corretos alterem status

## EN

### User roles
- client: browses, requests services, and tracks bookings
- provider: publishes services and manages incoming bookings

### Service rules
- Only authenticated providers can create/update/delete their services
- Public listing shows active services
- Core fields: title, description, category, price range, location, active status

### Booking rules
- Only authenticated clients can create bookings
- Providers must not request their own service
- Initial booking status: pending
- Allowed DB transitions:
  - pending -> accepted or rejected
  - accepted -> completed or cancelled

### Review rules
- Clients can review services
- Rating must be between 1 and 5
- Unique constraint: one review per client per service

### Dashboard rules
- If user_type is provider: ProviderDashboard
- Otherwise: ClientDashboard

### Business risks to monitor
- Booking provider_id must match service owner
- Price range validation (price_max >= price_min)
- Ensure only authorized actors can change status
