import { serviceClient } from "./clients";
import { FIXTURE_CATEGORY_ID } from "./env";

// Fabricas de dados de dominio, todas via service_role (ignoram RLS de proposito:
// montam o cenario; a verificacao de RLS e feita depois pelos clientes por-papel).

export async function createService(
  providerId: string,
  overrides: Partial<{
    title: string;
    description: string;
    price_min: number;
    price_max: number | null;
    price_type: "fixed" | "hourly" | "negotiable";
    is_active: boolean;
  }> = {},
): Promise<string> {
  const admin = serviceClient();
  const { data, error } = await admin
    .from("services")
    .insert({
      provider_id: providerId,
      category_id: FIXTURE_CATEGORY_ID,
      title: overrides.title ?? "Servico de teste",
      description: overrides.description ?? "Descricao do servico de teste",
      price_min: overrides.price_min ?? 100,
      price_max: overrides.price_max ?? null,
      price_type: overrides.price_type ?? "fixed",
      is_active: overrides.is_active ?? true,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Falha ao criar service: ${error.message}`);
  return data.id;
}

export async function createBooking(
  serviceId: string,
  clientId: string,
  providerId: string,
  status: "pending" | "accepted" | "completed" | "rejected" | "cancelled" = "pending",
): Promise<string> {
  const admin = serviceClient();
  const { data, error } = await admin
    .from("bookings")
    .insert({ service_id: serviceId, client_id: clientId, provider_id: providerId, status })
    .select("id")
    .single();
  if (error) throw new Error(`Falha ao criar booking: ${error.message}`);
  return data.id;
}

// Limpa os dados transacionais entre testes, preservando usuarios e categorias
// (recria-los a cada teste seria caro). Chamado em beforeEach dos arquivos de teste.
export async function resetDomainData(): Promise<void> {
  const admin = serviceClient();
  // Ordem respeita as FKs (reviews/bookings dependem de services).
  await admin.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}
