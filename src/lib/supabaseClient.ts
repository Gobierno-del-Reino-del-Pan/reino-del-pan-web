import { createClient } from '@supabase/supabase-js';

// 1. Añade este log aquí arriba para ver TODO lo que Vite está detectando
console.log("--- DIAGNÓSTICO DE VITE ---");
console.log("Todo el objeto env:", import.meta.env);
console.log("URL detectada:", import.meta.env.VITE_SUPABASE_URL);
console.log("---------------------------");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan las variables de entorno de Supabase en el .env");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');