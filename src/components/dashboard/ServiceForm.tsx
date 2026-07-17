import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { serviceSchema } from "@/lib/schemas/service";

interface ServiceFormProps {
  service?: any;
  onClose: () => void;
  onSaved: () => void;
}

export function ServiceForm({ service, onClose, onSaved }: ServiceFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: service?.title || "",
    description: service?.description || "",
    category_id: service?.category_id || "",
    price_min: service?.price_min ?? 0,
    price_max: service?.price_max ?? null as number | null,
    price_type: service?.price_type || "fixed",
    location: service?.location || "",
    is_active: service?.is_active ?? true,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = serviceSchema.safeParse({
      ...form,
      price_min: Number(form.price_min),
      price_max: form.price_max ? Number(form.price_max) : null,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const payload = {
      title: result.data.title,
      description: result.data.description,
      category_id: result.data.category_id,
      price_min: result.data.price_min,
      price_max: result.data.price_max,
      price_type: result.data.price_type as "fixed" | "hourly" | "negotiable",
      location: result.data.location || "",
      is_active: result.data.is_active,
      provider_id: user!.id,
    };

    if (service) {
      const { error } = await supabase.from("services").update(payload).eq("id", service.id);
      setLoading(false);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Serviço atualizado!" });
        onSaved();
      }
    } else {
      const { error } = await supabase.from("services").insert([payload]);
      setLoading(false);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Serviço criado!" });
        onSaved();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{service ? "Editar Serviço" : "Novo Serviço"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="svc-title">Título</Label>
            <Input
              id="svc-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Limpeza Residencial Completa"
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-desc">Descrição</Label>
            <Textarea
              id="svc-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Descreva o serviço em detalhes..."
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger aria-invalid={!!errors.category_id}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Tipo de preço</Label>
              <Select value={form.price_type} onValueChange={(v) => setForm({ ...form, price_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixo</SelectItem>
                  <SelectItem value="hourly">Por hora</SelectItem>
                  <SelectItem value="negotiable">A combinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-pmin">Preço mínimo (R$)</Label>
              <Input
                id="svc-pmin"
                type="number"
                min={0}
                step={0.01}
                value={form.price_min}
                onChange={(e) => setForm({ ...form, price_min: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-pmax">Preço máximo (R$)</Label>
              <Input
                id="svc-pmax"
                type="number"
                min={0}
                step={0.01}
                value={form.price_max ?? ""}
                onChange={(e) => setForm({ ...form, price_max: e.target.value ? Number(e.target.value) : null })}
                placeholder="Opcional"
                aria-invalid={!!errors.price_max}
              />
              {errors.price_max && <p className="text-sm text-destructive">{errors.price_max}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-loc">Localização</Label>
            <Input
              id="svc-loc"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ex: São Paulo, SP"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="svc-active"
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
            <Label htmlFor="svc-active">Serviço ativo</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : service ? "Salvar Alterações" : "Criar Serviço"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
