import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ServiHub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegação principal">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Início
          </Link>
          <Link to="/services" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Serviços
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile?.full_name || "Dashboard"}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/auth?tab=register">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t bg-card p-4 md:hidden" aria-label="Navegação mobile">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Início</Link>
            <Link to="/services" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Serviços</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Dashboard</Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>Sair</Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Entrar</Button>
                </Link>
                <Link to="/auth?tab=register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
