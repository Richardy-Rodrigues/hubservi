import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { ProviderDashboard } from "@/components/dashboard/ProviderDashboard";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Bem-vindo, {profile?.full_name || "Usuário"}!
            Você está logado como <strong>{profile?.user_type === "provider" ? "Prestador" : "Cliente"}</strong>.
          </p>
        </div>
        {profile?.user_type === "provider" ? <ProviderDashboard /> : <ClientDashboard />}
      </div>
    </Layout>
  );
}
