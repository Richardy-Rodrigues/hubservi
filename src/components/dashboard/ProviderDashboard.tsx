import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Briefcase, CalendarDays, CheckCircle2, Star, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ServiceForm } from "./ServiceForm";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  accepted: { label: "Aceito", variant: "default" },
  completed: { label: "Concluído", variant: "secondary" },
  rejected: { label: "Rejeitado", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export function ProviderDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["provider-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services(title),
          profiles!bookings_client_id_fkey(full_name, email)
        `)
        .eq("provider_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ["provider-services", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*, categories(name), service_stats(average_rating, review_count)")
        .eq("provider_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: status as any })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
      toast({ title: "Status atualizado!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
      toast({ title: "Serviço removido!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const stats = {
    totalServices: services?.length ?? 0,
    totalBookings: bookings?.length ?? 0,
    pending: bookings?.filter((b) => b.status === "pending").length ?? 0,
    completed: bookings?.filter((b) => b.status === "completed").length ?? 0,
    avgRating: services?.length
      ? (
          services.reduce((acc: number, s: any) => acc + (s.service_stats?.[0]?.average_rating ?? 0), 0) /
          services.filter((s: any) => s.service_stats?.[0]?.average_rating).length || 0
        ).toFixed(1)
      : "—",
  };

  const isLoading = loadingBookings || loadingServices;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (showServiceForm || editingService) {
    return (
      <ServiceForm
        service={editingService}
        onClose={() => {
          setShowServiceForm(false);
          setEditingService(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["provider-services"] });
          setShowServiceForm(false);
          setEditingService(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalServices}</p>
              <p className="text-sm text-muted-foreground">Serviços</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
              <p className="text-sm text-muted-foreground">Solicitações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgRating}</p>
              <p className="text-sm text-muted-foreground">Avaliação</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Solicitações</TabsTrigger>
          <TabsTrigger value="services">Meus Serviços</TabsTrigger>
        </TabsList>

        {/* Bookings tab */}
        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Recebidas</CardTitle>
            </CardHeader>
            <CardContent>
              {!bookings || bookings.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Nenhuma solicitação recebida ainda.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking: any) => {
                    const sc = statusConfig[booking.status] || statusConfig.pending;
                    return (
                      <div key={booking.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">{booking.services?.title || "Serviço"}</p>
                            <p className="text-sm text-muted-foreground">
                              Cliente: {booking.profiles?.full_name || "—"} ({booking.profiles?.email || ""})
                            </p>
                            {booking.scheduled_date && (
                              <p className="text-xs text-muted-foreground">
                                Data: {format(new Date(booking.scheduled_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </p>
                            )}
                          </div>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </div>
                        {booking.message && (
                          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">{booking.message}</p>
                        )}
                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateBooking.mutate({ id: booking.id, status: "accepted" })}
                              disabled={updateBooking.isPending}
                            >
                              Aceitar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBooking.mutate({ id: booking.id, status: "rejected" })}
                              disabled={updateBooking.isPending}
                            >
                              Rejeitar
                            </Button>
                          </div>
                        )}
                        {booking.status === "accepted" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateBooking.mutate({ id: booking.id, status: "completed" })}
                              disabled={updateBooking.isPending}
                            >
                              Marcar como Concluído
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBooking.mutate({ id: booking.id, status: "cancelled" })}
                              disabled={updateBooking.isPending}
                            >
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services tab */}
        <TabsContent value="services" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meus Serviços</CardTitle>
              <Button size="sm" onClick={() => setShowServiceForm(true)}>
                + Novo Serviço
              </Button>
            </CardHeader>
            <CardContent>
              {!services || services.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Nenhum serviço cadastrado.</p>
              ) : (
                <div className="space-y-4">
                  {services.map((service: any) => {
                    const sr = service.service_stats?.[0];
                    return (
                      <div key={service.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{service.title}</p>
                            <Badge variant={service.is_active ? "default" : "outline"}>
                              {service.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{service.categories?.name}</p>
                          {sr?.average_rating > 0 && (
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {Number(sr.average_rating).toFixed(1)} ({sr.review_count})
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingService(service)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm("Remover este serviço?")) deleteService.mutate(service.id);
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
