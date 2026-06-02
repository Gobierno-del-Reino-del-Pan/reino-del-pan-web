import { Link } from "wouter";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="container mx-auto max-w-xl text-center">
        <div className="mb-8 inline-flex rounded-full bg-secondary p-6 text-accent">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="display-font text-5xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="mt-6 text-base leading-8 text-foreground/70">
          Parece que esta ruta no existe. Vuelve al inicio para continuar explorando el Reino del Pan.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center justify-center rounded-full border-2 border-accent bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent transition hover:bg-accent hover:text-accent-foreground"
        >
          <Home className="mr-2 h-4 w-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
