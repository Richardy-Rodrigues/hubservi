import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { ProviderDashboard } from "@/components/dashboard/ProviderDashboard";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Bem-vindo, {profile?.full_name || "Usuário"}!
              Você está logado como <strong>{profile?.user_type === "provider" ? "Prestador" : "Cliente"}</strong>.
            </p>
          </div>
          <ProfileForm />
        </div>
        {profile?.user_type === "provider" ? <ProviderDashboard /> : <ClientDashboard />}
      </div>
    </Layout>
  );
}
