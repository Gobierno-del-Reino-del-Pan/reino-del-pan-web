import { FormEvent, useState } from "react";

import { supabase } from "../lib/supabaseClient";

export default function MasaLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se ha podido iniciar sesión."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#07080c] text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <span className="inline-block text-[10px] uppercase tracking-[0.35em] font-bold text-accent border border-white/10 bg-white/5 rounded-full px-4 py-2">
                        Gobierno del Reino del Pan
                    </span>

                    <h1 className="mt-5 text-4xl font-black tracking-tight">
                        M@SA
                    </h1>

                    <p className="mt-2 text-sm text-white/40">
                        Sistema de acceso administrativo
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8"
                >
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs uppercase tracking-[0.15em] font-bold text-white/50 mb-2">
                                Correo electrónico
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                autoComplete="email"
                                placeholder="usuario@reinodelpan..."
                                className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-accent/60"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-[0.15em] font-bold text-white/50 mb-2">
                                Contraseña
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-accent/60"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-2xl bg-accent text-black font-black py-3 px-4 transition-opacity disabled:opacity-50"
                    >
                        {loading ? "Accediendo…" : "Acceder a M@SA"}
                    </button>
                </form>
            </div>
        </main>
    );
}