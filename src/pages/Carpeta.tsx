import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

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
  categoria?: "profesiones" | "regiones" | "estado_ciudadano" | "especiales" | "equipos" | "mafia";
  discord_role_id: string;
}

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

interface EconomyData {
  cash: number;
  bank: number;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  inGuild: boolean;
  verificado: boolean;
  dpi: DPIData | null;
  roles: Rol[];
  matrimonio: Matrimonio | null;
  hijos: Hijo[];
  level?: number;
  xp?: number;
  total_xp?: number;
  messages?: number;

  economy?: EconomyData | null;
  puntos_elo?: string | number | null;
  pokemon_favorito?: string | null;
}

// ── HELPER PARA PARSEAR PUNTOS BASE (PB) ──
function parsePuntosElo(rawVal: string | number | null | undefined): string {
  if (rawVal === null || rawVal === undefined) return "0";
  const strVal = String(rawVal);
  // Si contiene comas (ej. "1000,1000,1,216,0,0"), toma solo el primer valor
  const val = strVal.split(",")[0].trim() || "0";
  const num = Number(val);
  return isNaN(num) ? val : num.toLocaleString("es-ES");
}

// ── COMPONENTE PARA EL POKÉMON FAVORITO ──
function PokemonAvatar({ pokemonName }: { pokemonName: string }) {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pokemonName) return;

    const formattedName = pokemonName.trim().toLowerCase().replace(/\s+/g, "-");
    fetch(`https://pokeapi.co/api/v2/pokemon/${formattedName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Pokémon no encontrado");
        return res.json();
      })
      .then((data) => {
        const homeSprite =
          data?.sprites?.other?.home?.front_default ||
          data?.sprites?.other?.["official-artwork"]?.front_default ||
          data?.sprites?.front_default;
        setSpriteUrl(homeSprite);
      })
      .catch(() => setSpriteUrl(null))
      .finally(() => setLoading(false));
  }, [pokemonName]);

  return (
    <div
      className="flex items-center gap-2 bg-[var(--accent)]/5 border border-[var(--border)] hover:border-accent/30 transition-colors duration-200 rounded-xl px-3 py-2 shadow-sm"
      title={`Pokémon favorito: ${pokemonName}`}
    >
      <div className="w-10 h-10 flex items-center justify-center bg-accent/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
        ) : spriteUrl ? (
          <img
            src={spriteUrl}
            alt={pokemonName}
            className="w-10 h-10 object-contain drop-shadow-md transition-transform hover:scale-110 duration-200"
          />
        ) : (
          <span className="text-lg">🐾</span>
        )}
      </div>
      <div className="hidden sm:block text-left">
        <p className="text-[9px] uppercase tracking-wider text-foreground/50 font-medium">Pokémon</p>
        <p className="text-xs font-semibold capitalize text-foreground">{pokemonName}</p>
      </div>
    </div>
  );
}

function RolIcono({ rol }: { rol: Rol }) {
  if (rol.emoji) {
    return <div className="text-4xl drop-shadow-sm leading-none select-none">{rol.emoji}</div>;
  }
  if (rol.imagen) {
    return (
      <img
        src={rol.imagen}
        alt={rol.nombre}
        className="w-10 h-10 object-contain drop-shadow-sm"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return <div className="text-4xl drop-shadow-sm leading-none select-none">💼</div>;
}

function RolCard({ rol }: { rol: Rol }) {
  return (
    <div className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-background/40 hover:border-accent/40 hover:bg-accent/5 hover:shadow-md transition-all duration-200">
      <RolIcono rol={rol} />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2 truncate">
          {rol.nombre}
        </h3>
        {rol.descripcion && (
          <p className="text-xs text-foreground/60 mt-1 leading-relaxed line-clamp-2">
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
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="px-6 py-4 border-b border-border bg-background/20">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold">
          {titulo}
        </p>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((rol) => (
            <RolCard key={rol.discord_role_id} rol={rol} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const CATEGORIAS: { key: string; titulo: string }[] = [
  { key: "profesiones", titulo: "Mi profesión" },
  { key: "regiones", titulo: "Mi región" },
  { key: "estado_ciudadano", titulo: "Estado ciudadano" },
  { key: "equipos", titulo: "Mi Equipo" },
  { key: "mafia", titulo: "Registros de Familia / Mafia" },
  { key: "especiales", titulo: "Roles especiales" },
  { key: "servicios", titulo: "Servicios" }
];

export default function Carpeta() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/me");
        if (res.status === 401) {
          window.location.href = "/auth/discord";
          return;
        }
        const d = await res.json();
        if (!d || !d.user) {
          navigate("/");
          return;
        }

        const baseUser: DiscordUser = d.user;
        const discordId = baseUser.id;

        const { data: economyData } = await supabase
          .from("users_economy")
          .select("cash, bank")
          .eq("id", discordId)
          .maybeSingle();

        const { data: usuarioData } = await supabase
          .from("usuarios")
          .select("puntos_elo, pokemon_favorito")
          .eq("discord_id", discordId)
          .maybeSingle();

        setUser({
          ...baseUser,
          economy: economyData ? { cash: Number(economyData.cash) || 0, bank: Number(economyData.bank) || 0 } : null,
          puntos_elo: usuarioData?.puntos_elo ?? 0,
          pokemon_favorito: usuarioData?.pokemon_favorito ?? null,
        });
      } catch (err) {
        console.error("Error al cargar datos:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
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
            <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto shadow-sm" />
            <p className="text-foreground/50 text-sm font-medium animate-pulse">Cargando tu carpeta…</p>
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
            className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 rounded-2xl shadow-lg"
          >
            <div className="text-5xl animate-bounce">🍞</div>
            <h1 className="text-2xl font-bold">Necesitas unirte al Reino</h1>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Para acceder a tu carpeta de ciudadano necesitas formar parte del servidor oficial del Reino del Pan y tener un DPI registrado.
            </p>
            <div className="space-y-3">
              <a
                href="https://discord.gg/reino-del-pan-1381359904731693056"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
                style={{ background: "#5865F2", color: "#fff" }}
              >
                Unirme al servidor
              </a>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border border-border text-foreground/60 text-sm hover:border-accent/50 hover:text-foreground transition-colors"
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
            className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 rounded-2xl shadow-lg"
          >
            <div className="text-5xl">📋</div>
            <h1 className="text-2xl font-bold">Sin DPI registrado</h1>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Hola <strong className="text-foreground">{user.username}</strong>, para acceder a tu carpeta necesitas crear tu DPI y verificarte en Discord.
            </p>
            <div className="space-y-3">
              <Link
                href="/dpi/create"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-accent bg-accent text-background font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
              >
                Crear mi DPI
              </Link>
              <a
                href="https://discord.gg/reino-del-pan-1381359904731693056"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-foreground/70 text-sm hover:border-[#5865F2]/50 hover:text-[#5865F2] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                </svg>
                Verificarme en Discord
              </a>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border border-border text-foreground/60 text-sm hover:border-red-500/50 hover:text-red-400 transition-colors"
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
    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());

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
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* LADO IZQUIERDO: Avatar e Información básica */}
            <div className="flex items-center gap-5">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-16 h-16 rounded-full border-2 border-accent/30 object-cover shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                }}
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-accent font-semibold">Ciudadano Registrado</p>
                <h1 className="mt-1 text-2xl font-semibold display-font text-foreground">{nombreCompleto}</h1>
                <p className="text-xs text-foreground/40 font-mono mt-1.5">@{user.username}</p>
              </div>
            </div>

            {/* LADO DERECHO: Pokémon Favorito + Nivel del Ciudadano */}
            <div className="flex items-center gap-3">
              {user.pokemon_favorito && (
                <PokemonAvatar pokemonName={user.pokemon_favorito} />
              )}

              <div className="flex flex-col items-center justify-center bg-[var(--accent)]/5 border border-[var(--border)] rounded-xl px-5 py-3.5 min-w-[120px] text-center sm:text-right sm:items-end gap-1 shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium font-[var(--body-font)]">
                  Nivel
                </span>
                <span className="text-4xl font-normal text-[var(--primary)] leading-none font-[var(--display-font)]">
                  {user.level ?? 0}
                </span>

                {user.xp !== undefined && (
                  <div className="w-full mt-1 space-y-1">
                    <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary)] transition-all duration-500"
                        style={{ width: `${Math.min(((user.xp ?? 0) % 1000) / 10, 100)}%` }}
                      />
                    </div>
                    <p className="text-[8px] font-mono tracking-widest text-[var(--muted-foreground)] opacity-70">
                      {(user.xp ?? 0).toLocaleString("es-ES")} XP
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* MÓDULO: Finanzas y Puntos Base (PB) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Laboral Panian Bank */}
            <div className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between gap-4 shadow-sm hover:border-accent/30 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <img
                  src="/LaboralBank/LPB.png"
                  alt="Laboral Panian Bank"
                  className="w-10 h-10 object-contain drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/50 font-medium">
                    Laboral Panian Bank
                  </p>
                  <p className="text-lg font-bold font-mono text-emerald-400">
                    {(user.economy?.bank ?? 0).toLocaleString("es-ES")} <span className="font-sans text-xs font-normal">Ᵽ</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase text-foreground/40 font-mono">Efectivo</p>
                <p className="text-xs font-mono text-foreground/70">
                  {(user.economy?.cash ?? 0).toLocaleString("es-ES")} Ᵽ
                </p>
              </div>
            </div>

            {/* Puntos Base (PB) */}
            <div className="p-5 rounded-2xl border border-border bg-card flex items-center gap-4 shadow-sm hover:border-accent/30 transition-colors duration-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-lg shadow-inner">
                PB
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-foreground/50 font-medium">
                  Puntos Base Ciudadanía
                </p>
                <p className="text-lg font-bold font-mono text-amber-400">
                  {parsePuntosElo(user.puntos_elo)} <span className="text-xs font-normal text-foreground/60">PB</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* MÓDULO: Relaciones Familiares (Matrimonio e Hijos) */}
          {(user.matrimonio || (user.hijos && user.hijos.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold border-b border-border pb-2">
                Núcleo Familiar
              </p>

              {user.matrimonio && (
                <div className="flex items-center gap-4 bg-background/30 p-3 rounded-xl border border-border/60 hover:border-accent/30 transition-colors duration-200">
                  <span className="text-2xl select-none">💍</span>
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={user.matrimonio.conyuge_avatar}
                      alt={user.matrimonio.conyuge_username}
                      className="w-9 h-9 rounded-full object-cover border border-accent/20 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                      }}
                    />
                    <div>
                      <p className="text-xs text-foreground/50">Casado/a con:</p>
                      <p className="text-sm font-medium text-foreground">@{user.matrimonio.conyuge_username}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-foreground/40 hidden sm:block">
                    Desde: {new Date(user.matrimonio.fecha_boda).toLocaleDateString("es-ES")}
                  </span>
                </div>
              )}

              {user.hijos && user.hijos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground/50 font-medium pl-1">Hijos registrados:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {user.hijos.map((hijo) => (
                      <div key={hijo.hijo_id} className="flex items-center gap-3 bg-background/20 p-2.5 rounded-xl border border-border/40 hover:border-accent/20 transition-colors duration-200">
                        <span className="text-xl select-none">{hijo.tipo === "adoptivo" ? "🧒" : "🍼"}</span>
                        <img
                          src={hijo.hijo_avatar}
                          alt={hijo.hijo_username}
                          className="w-8 h-8 rounded-full object-cover shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">@{hijo.hijo_username}</p>
                          <p className="text-[10px] text-accent/70 capitalize font-mono">{hijo.tipo}</p>
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
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border bg-background/20">
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold">Mi profesión</p>
              </div>
              <div className="px-6 py-8 text-center space-y-2">
                <span className="text-2xl block">📂</span>
                <p className="text-foreground/50 text-sm font-medium">Aún no tienes una profesión asignada.</p>
              </div>
            </div>
          )}

          {/* Cierre de sesión */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/40 hover:text-red-400 active:scale-95 transition-all duration-200 group py-2 px-4 rounded-lg hover:bg-red-500/5"
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