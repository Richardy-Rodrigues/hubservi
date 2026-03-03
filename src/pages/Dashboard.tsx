import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Bem-vindo, {profile?.full_name || "Usuário"}!
          Você está logado como <strong>{profile?.user_type === "provider" ? "Prestador" : "Cliente"}</strong>.
        </p>
        <div className="mt-8 rounded-xl border bg-card p-8 text-center text-muted-foreground">
          <p>O dashboard completo será implementado na Fase 2.</p>
        </div>
      </div>
    </Layout>
  );
}
