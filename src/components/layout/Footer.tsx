import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" aria-hidden="true" className="h-8 w-8 rounded-lg" />
            <span className="font-semibold">HubServi</span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground" aria-label="Links do rodapé">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <Link to="/services" className="hover:text-foreground">Serviços</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HubServi. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
