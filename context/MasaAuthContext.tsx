import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../src/lib/supabaseClient";

interface MasaAuthContextValue {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const MasaAuthContext = createContext<MasaAuthContextValue | undefined>(
    undefined
);

interface MasaAuthProviderProps {
    children: ReactNode;
}

export function MasaAuthProvider({ children }: MasaAuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function cargarSesion() {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error) {
                console.error("Error cargando sesión M@SA:", error);
            }

            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        }

        cargarSesion();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    async function signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Error cerrando sesión M@SA:", error);
            throw error;
        }
    }

    return (
        <MasaAuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                loading,
                signOut,
            }}
        >
            {children}
        </MasaAuthContext.Provider>
    );
}

export function useMasaAuth() {
    const context = useContext(MasaAuthContext);

    if (!context) {
        throw new Error(
            "useMasaAuth debe utilizarse dentro de un MasaAuthProvider"
        );
    }

    return context;
}