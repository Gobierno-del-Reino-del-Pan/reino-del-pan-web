import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

interface DPIData {
  dpi_number: string;
  nombre: string;
  apellidos: string;
  genero: string;
  fecha_nac: string;
  region: string;
  issued_at: string;
  valid_until: string;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  emoji?: string;
  imagen?: string | null;
  // Actualizado para soportar las nuevas categorías del JSON
  categoria?: "profesiones" | "regiones" | "estado_ciudadano" | "especiales" | "equipos" | "mafia";
  discord_role_id: string;
}

// Interfaces para Relaciones Familiares
interface Matrimonio {
  conyuge_id: string;
  conyuge_username: string;
  conyuge_avatar: string;
  fecha_boda: string;
}

interface Hijo {
  hijo_id: string;
  hijo_username: string;
  hijo_avatar: string;
  tipo: "adoptivo" | "creado";
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  inGuild: boolean;
  verificado: boolean;
  dpi: DPIData | null;
  roles: Rol[];
  matrimonio: Matrimonio | null; // Añadido
  hijos: Hijo[];                 // Añadido
}

function RolIcono({ rol }: { rol: Rol }) {
  if (rol.emoji) {
    return <div className="text-4xl drop-shadow-sm leading-none">{rol.emoji}</div>;
  }
  if (rol.imagen) {
    return (
      <img
        src={rol.imagen}
        alt={rol.nombre}
        className="w-10 h-10 object-contain drop-shadow-sm"
      />
    );
  }
  return <div className="text-4xl drop-shadow-sm leading-none">💼</div>;
}

function RolCard({ rol }: { rol: Rol }) {
  return (
    <div
      className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-background/40 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200"
    >
      <RolIcono rol={rol} />
      <div className="flex-1">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          {rol.nombre}
        </h3>
        {rol.descripcion && (
          <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
            {rol.descripcion}
          </p>
        )}
      </div>
    </div>
  );
}

function RolSeccion({ titulo, roles }: { titulo: string; roles: Rol[] }) {
  if (roles.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">
          {titulo}
        </p>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map(rol => (
            <RolCard key={rol.discord_role_id} rol={rol} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Mapeo de categorías actualizado con las dos nuevas secciones requeridas
const CATEGORIAS: { key: string; titulo: string }[] = [
  { key: "profesiones", titulo: "Mi profesión" },
  { key: "regiones", titulo: "Mi región" },
  { key: "estado_ciudadano", titulo: "Estado ciudadano" },
  { key: "equipos", titulo: "Mi Equipo" },
  { key: "mafia", titulo: "Registros de Familia / Mafia" },
  { key: "especiales", titulo: "Roles especiales" },
];

export default function Carpeta() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then(r => {
        if (r.status === 401) {
          window.location.href = "/auth/discord";
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        if (!d.user) {
          navigate("/");
          return;
        }
        setUser(d.user);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    window.location.href = "/auth/logout";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
            <p className="text-foreground/50 text-sm">Cargando tu carpeta…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  if (!user.inGuild) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="text-5xl">🍞</div>
            <h1 className="text-2xl font-bold">Necesitas unirte al Reino</h1>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Para acceder a tu carpeta de ciudadano necesitas formar parte del servidor oficial del Reino del Pan y tener un DPI registrado.
            </p>
            <div className="space-y-3">
              <a
                href="https://discord.gg/reino-del-pan-1381359904731693056"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm"
                style={{ background: "#5865F2", color: "#fff" }}
              >
                Unirme al servidor
              </a>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border border-border text-foreground/60 text-sm hover:border-accent/50 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user.dpi) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="text-5xl">📋</div>
            <h1 className="text-2xl font-bold">Sin DPI registrado</h1>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Hola <strong className="text-foreground">{user.username}</strong>, para acceder a tu carpeta necesitas crear tu DPI y verificarte en Discord.
            </p>
            <div className="space-y-3">
              <Link
                href="/dpi/create"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-accent bg-accent text-background font-semibold text-sm hover:opacity-90 transition"
              >
                Crear mi DPI
              </Link>
              <a
                href="https://discord.gg/reino-del-pan-1381359904731693056"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-foreground/70 text-sm hover:border-[#5865F2]/50 hover:text-[#5865F2] transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                </svg>
                Verificarme en Discord
              </a>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border border-border text-foreground/60 text-sm hover:border-red-500/50 hover:text-red-400 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const dpi = user.dpi;
  const nombreCompleto = `${dpi.nombre} ${dpi.apellidos}`.toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

  // Agrupación de roles dinámicos
  const rolesPorCategoria: Record<string, Rol[]> = {};
  for (const rol of user.roles) {
    const cat = rol.categoria || "otros";
    if (!rolesPorCategoria[cat]) rolesPorCategoria[cat] = [];
    rolesPorCategoria[cat].push(rol);
  }
  const otros = rolesPorCategoria["otros"] || [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-0">
        <div className="container mx-auto max-w-2xl space-y-8">

          {/* Ficha Perfil Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center gap-5">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-16 h-16 rounded-full border-2 border-accent/30 object-cover"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-accent">Ciudadano Registrado</p>
                <h1 className="mt-1 text-2xl font-semibold display-font text-foreground">{nombreCompleto}</h1>
                <p className="text-xs text-foreground/40 font-mono">@{user.username}</p>
              </div>
            </div>
          </motion.div>

          {/* NUEVO MÓDULO: Relaciones Familiares (Matrimonio e Hijos) */}
          {(user.matrimonio || user.hijos?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-border bg-card space-y-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium border-b border-border pb-2">
                Núcleo Familiar Familiar
              </p>

              {/* Estado de Casado */}
              {user.matrimonio && (
                <div className="flex items-center gap-4 bg-background/30 p-3 rounded-xl border border-border/60">
                  <span className="text-2xl">💍</span>
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={user.matrimonio.conyuge_avatar}
                      alt={user.matrimonio.conyuge_username}
                      className="w-9 h-9 rounded-full object-cover border border-accent/20"
                    />
                    <div>
                      <p className="text-xs text-foreground/50">Casado/a con:</p>
                      <p className="text-sm font-medium text-foreground">@{user.matrimonio.conyuge_username}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-foreground/30 hidden sm:block">
                    Desde: {new Date(user.matrimonio.fecha_boda).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Lista de Hijos */}
              {user.hijos && user.hijos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/50 font-medium pl-1">Hijos registrados:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {user.hijos.map((hijo) => (
                      <div key={hijo.hijo_id} className="flex items-center gap-3 bg-background/20 p-2.5 rounded-xl border border-border/40">
                        <span className="text-xl">{hijo.tipo === "adoptivo" ? "🧒" : "🍼"}</span>
                        <img
                          src={hijo.hijo_avatar}
                          alt={hijo.hijo_username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-medium text-foreground">@{hijo.hijo_username}</p>
                          <p className="text-[10px] text-accent/70 capitalize">{hijo.tipo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Secciones de Roles del Servidor */}
          {user.roles.length > 0 ? (
            <>
              {CATEGORIAS.map(({ key, titulo }) => (
                <RolSeccion key={key} titulo={titulo} roles={rolesPorCategoria[key] || []} />
              ))}
              <RolSeccion titulo="Otros roles" roles={otros} />
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">Mi profesión</p>
              </div>
              <div className="px-6 py-5 text-center py-6">
                <p className="text-foreground/40 text-sm">Aún no tienes una profesión asignada.</p>
              </div>
            </div>
          )}

          {/* Cierre de sesión */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/30 hover:text-red-400 transition-colors duration-200 group"
            >
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}