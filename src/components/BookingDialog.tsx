import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { CalendarDays } from "lucide-react";

interface BookingDialogProps {
  serviceId: string;
  providerId: string;
  serviceTitle: string;
}

export function BookingDialog({ serviceId, providerId, serviceTitle }: BookingDialogProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  if (!user) {
    return (
      <Button className="w-full" size="lg" onClick={() => navigate("/auth")}>
        Entre para solicitar
      </Button>
    );
  }

  if (profile?.user_type === "provider") {
    return null;
  }

  if (user.id === providerId) {
    return null;
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({ title: "Mensagem obrigatória", description: "Descreva o que você precisa.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      service_id: serviceId,
      provider_id: providerId,
      client_id: user.id,
      message: message.trim(),
      scheduled_date: scheduledDate || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao solicitar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Solicitação enviada!", description: "O prestador será notificado." });
      setOpen(false);
      setMessage("");
      setScheduledDate("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <CalendarDays className="mr-2 h-4 w-4" /> Solicitar Serviço
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Serviço</DialogTitle>
          <DialogDescription>{serviceTitle}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="booking-message">Descreva o que você precisa</Label>
            <Textarea
              id="booking-message"
              placeholder="Ex: Preciso de uma limpeza completa no apartamento de 2 quartos..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-date">Data desejada (opcional)</Label>
            <Input
              id="booking-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
