import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, MapPin, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ITEMS_PER_PAGE = 12;

type SortOption = "recent" | "rating" | "popular";

export default function Services() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [page, setPage] = useState(0);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services", search, categoryId, sort, page],
    queryFn: async () => {
      let query = supabase
        .from("services")
        .select(`
          *,
          categories(name, icon),
          profiles!services_provider_id_fkey(full_name, avatar_url)
        `, { count: "exact" })
        .eq("is_active", true);

      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }
      if (categoryId !== "all") {
        query = query.eq("category_id", categoryId);
      }

      if (sort === "recent") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      query = query.range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      let sorted = data || [];
      if (sort === "rating") {
        sorted = [...sorted].sort((a, b) => {
          const ar = (a as any).service_stats?.[0]?.average_rating ?? 0;
          const br = (b as any).service_stats?.[0]?.average_rating ?? 0;
          return br - ar;
        });
      } else if (sort === "popular") {
        sorted = [...sorted].sort((a, b) => {
          const ac = (a as any).service_stats?.[0]?.review_count ?? 0;
          const bc = (b as any).service_stats?.[0]?.review_count ?? 0;
          return bc - ac;
        });
      }

      return { services: sorted, total: count ?? 0 };
    },
  });

  const services = servicesData?.services ?? [];
  const totalPages = Math.ceil((servicesData?.total ?? 0) / ITEMS_PER_PAGE);

  const formatPrice = (min: number, max: number | null, type: string) => {
    const fmt = (v: number) =>
      v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    if (type === "negotiable") return "A combinar";
    if (max && max > min) return `${fmt(min)} - ${fmt(max)}`;
    return fmt(min);
  };

  const priceLabel = (type: string) => {
    if (type === "hourly") return "/hora";
    if (type === "negotiable") return "";
    return "";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="mt-1 text-muted-foreground">Encontre o profissional perfeito para você</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
              aria-label="Buscar serviços"
            />
          </div>
          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(0); }}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por categoria">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => { setSort(v as SortOption); setPage(0); }}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Ordenar por">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="rating">Melhor avaliação</SelectItem>
              <SelectItem value="popular">Mais populares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="mb-4 h-6 w-3/4" /><Skeleton className="mb-2 h-4 w-full" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">Nenhum serviço encontrado.</p>
            <p className="mt-1 text-sm text-muted-foreground">Tente ajustar os filtros.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => {
                const stats = service.service_stats?.[0];
                const rating = stats?.average_rating ?? 0;
                const reviewCount = stats?.review_count ?? 0;
                return (
                  <Link key={service.id} to={`/services/${service.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardContent className="flex h-full flex-col p-6">
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {service.categories?.name}
                          </Badge>
                          {rating > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{Number(rating).toFixed(1)}</span>
                              <span className="text-muted-foreground">({reviewCount})</span>
                            </div>
                          )}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold leading-tight">{service.title}</h3>
                        <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between border-t pt-4">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(service.price_min, service.price_max, service.price_type)}
                            <span className="text-xs font-normal text-muted-foreground">{priceLabel(service.price_type)}</span>
                          </span>
                          {service.location && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {service.location}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          por {service.profiles?.full_name || "Profissional"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
