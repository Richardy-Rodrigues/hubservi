import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Star, Shield } from "lucide-react";

export default function Index() {
  return (
    <Layout>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center md:py-32">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
          Encontre o profissional <span className="text-primary">ideal</span> para qualquer serviço
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Conectamos você a prestadores de serviços avaliados e confiáveis. Busque, compare e contrate com segurança.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/services">
            <Button size="lg" className="gap-2 px-8">
              Explorar Serviços <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth?tab=register">
            <Button size="lg" variant="outline" className="px-8">
              Cadastre-se Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
            Por que usar o HubServi?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Search className="h-8 w-8 text-primary" />,
                title: "Busca Avançada",
                desc: "Encontre serviços por categoria, localização e avaliações com filtros avançados.",
              },
              {
                icon: <Star className="h-8 w-8 text-primary" />,
                title: "Avaliações Reais",
                desc: "Avaliações verificadas de clientes que realmente contrataram o serviço.",
              },
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: "Segurança Total",
                desc: "Dados protegidos e transações seguras entre cliente e prestador.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Pronto para começar?</h2>
        <p className="mt-3 text-muted-foreground">
          Cadastre-se agora e conecte-se com os melhores profissionais.
        </p>
        <Link to="/auth?tab=register" className="mt-8 inline-block">
          <Button size="lg" className="gap-2 px-8">
            Criar Conta <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </Layout>
  );
}
