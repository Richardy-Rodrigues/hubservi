import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

interface ReviewFormProps {
  serviceId: string;
  providerId: string;
}

export function ReviewForm({ serviceId, providerId }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Only clients with at least one completed booking on this service may review.
  // Also blocks the second review (UNIQUE(service_id, client_id)).
  const { data: eligibility } = useQuery({
    queryKey: ["review-eligibility", serviceId, user?.id],
    queryFn: async () => {
      const [completedBooking, existingReview] = await Promise.all([
        supabase
          .from("bookings")
          .select("id")
          .eq("service_id", serviceId)
          .eq("client_id", user!.id)
          .eq("status", "completed")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("reviews")
          .select("id")
          .eq("service_id", serviceId)
          .eq("client_id", user!.id)
          .maybeSingle(),
      ]);
      return {
        hasCompletedBooking: !!completedBooking.data,
        hasReviewed: !!existingReview.data,
      };
    },
    enabled: !!user && profile?.user_type === "client",
  });

  if (!user || profile?.user_type !== "client") return null;
  if (!eligibility) return null;
  if (eligibility.hasReviewed) return null;
  if (!eligibility.hasCompletedBooking) return null;

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({ title: "Selecione uma nota", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      service_id: serviceId,
      provider_id: providerId,
      client_id: user.id,
      rating,
      comment: comment.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar avaliação", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Avaliação enviada!" });
    setRating(0);
    setComment("");
    queryClient.invalidateQueries({ queryKey: ["reviews", serviceId] });
    queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
    queryClient.invalidateQueries({ queryKey: ["review-eligibility", serviceId, user.id] });
  };

  return (
    <div className="mt-6 rounded-lg border bg-muted/30 p-4 space-y-3">
      <p className="text-sm font-medium">Deixe sua avaliação</p>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((s) => {
          const active = (hover || rating) >= s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={rating === s}
              aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="p-1"
            >
              <Star className={`h-6 w-6 ${active ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
            </button>
          );
        })}
      </div>
      <Textarea
        placeholder="Conte como foi sua experiência (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
      />
      <Button onClick={handleSubmit} disabled={loading || rating < 1} size="sm">
        {loading ? "Enviando..." : "Enviar avaliação"}
      </Button>
    </div>
  );
}
