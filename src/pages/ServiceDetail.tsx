import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPublicProfileById,
  fetchPublicProfilesByIds,
  type PublicProfileSummary,
} from "@/integrations/supabase/views";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, ArrowLeft, User, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BookingDialog } from "@/components/BookingDialog";
import { ReviewForm } from "@/components/ReviewForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, categories(name, icon)")
        .eq("id", id!)
        .single();
      if (error) throw error;

      const [{ data: statsData }, providerRow] = await Promise.all([
        supabase
          .from("service_stats")
          .select("average_rating, review_count")
          .eq("service_id", id!)
          .maybeSingle(),
        fetchPublicProfileById(data.provider_id),
      ]);

      return { ...data, stats: statsData, provider: providerRow };
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("service_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const clientIds = Array.from(new Set((data ?? []).map((r) => r.client_id)));
      const clientMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (clientIds.length > 0) {
        const clientRows = await fetchPublicProfilesByIds(clientIds);
        clientRows.forEach((p: PublicProfileSummary) => {
          clientMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }
      return (data ?? []).map((r) => ({ ...r, client: clientMap[r.client_id] ?? null }));
    },
    enabled: !!id,
  });

  const { data: similar } = useQuery({
    queryKey: ["similar-services", service?.category_id, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, categories(name)")
        .eq("category_id", service!.category_id)
        .eq("is_active", true)
        .neq("id", id!)
        .limit(3);
      if (error) throw error;

      const ids = (data ?? []).map((s) => s.id);
      const ratingByService: Record<string, number> = {};
      if (ids.length > 0) {
        const { data: statsRows } = await supabase
          .from("service_stats")
          .select("service_id, average_rating")
          .in("service_id", ids);
        (statsRows ?? []).forEach((row) => {
          ratingByService[row.service_id] = Number(row.average_rating) || 0;
        });
      }
      return (data ?? []).map((s) => ({ ...s, rating: ratingByService[s.id] ?? 0 }));
    },
    enabled: !!service?.category_id,
  });

  const formatPrice = (min: number, max: number | null, type: string) => {
    const fmt = (v: number) =>
      v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    if (type === "negotiable") return "A combinar";
    if (max && max > min) return `${fmt(min)} - ${fmt(max)}`;
    return fmt(min);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <Skeleton className="mb-4 h-8 w-1/3" />
          <Skeleton className="mb-2 h-6 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">Serviço não encontrado.</p>
          <Link to="/services" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const rating = (service as any).stats?.average_rating ?? 0;
  const reviewCount = (service as any).stats?.review_count ?? 0;
  const provider = (service as any).provider;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <Link to="/services" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar aos serviços
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">{(service as any).categories?.name}</Badge>
              <h1 className="text-3xl font-bold">{service.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <strong className="text-foreground">{Number(rating).toFixed(1)}</strong>
                    ({reviewCount} avaliações)
                  </span>
                )}
                {service.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {service.location}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">Descrição</h2>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{service.description}</p>
            </div>

            {/* Reviews */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">
                Avaliações {reviewCount > 0 && <span className="text-muted-foreground font-normal">({reviewCount})</span>}
              </h2>
              {!reviews || reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.client?.full_name || "Cliente"}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3 w-3 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.created_at), "dd MMM yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              <ReviewForm serviceId={service.id} providerId={service.provider_id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(service.price_min, service.price_max, service.price_type)}
                </p>
                {service.price_type === "hourly" && (
                  <p className="text-sm text-muted-foreground">por hora</p>
                )}
                <div className="mt-6">
                  <BookingDialog
                    serviceId={service.id}
                    providerId={service.provider_id}
                    serviceTitle={service.title}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Provider info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Profissional</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{provider?.full_name || "Profissional"}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Membro desde {format(new Date(service.created_at), "MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar */}
            {similar && similar.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Serviços Similares</h3>
                <div className="space-y-3">
                  {similar.map((s: any) => {
                    const sr = s.rating ?? 0;
                    return (
                      <Link key={s.id} to={`/services/${s.id}`}>
                        <Card className="transition-shadow hover:shadow-md">
                          <CardContent className="p-4">
                            <p className="font-medium text-sm">{s.title}</p>
                            {sr > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {Number(sr).toFixed(1)}
                              </span>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
