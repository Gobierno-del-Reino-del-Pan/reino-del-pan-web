import { createClient } from '@supabase/supabase-js';

// Vite lee las variables a través de import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan las variables de entorno de Supabase en el .env");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');