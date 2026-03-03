import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="font-semibold">ServiHub</span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground" aria-label="Links do rodapé">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <Link to="/services" className="hover:text-foreground">Serviços</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ServiHub. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
