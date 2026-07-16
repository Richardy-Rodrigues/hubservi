-- Seed do ambiente de testes de integracao (aplicado por `supabase db reset`).
--
-- A migration base insere 10 categorias com id = gen_random_uuid(), portanto seus
-- UUIDs nao sao deterministicos entre resets. As fixtures de teste precisam de um
-- category_id estavel para criar services sem depender de uma consulta previa por
-- nome. Inserimos aqui uma categoria de UUID fixo, reservada aos testes.
--
-- Idempotente: ON CONFLICT no id (PK) permite reaplicar sem erro.

INSERT INTO public.categories (id, name, description, icon)
VALUES (
  '00000000-0000-0000-0000-0000000000c1',
  'Testes (fixture)',
  'Categoria de UUID fixo reservada aos testes de integracao',
  'flask'
)
ON CONFLICT (id) DO NOTHING;
