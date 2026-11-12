export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Acepta el nombre clásico (ANON_KEY) o el nuevo de Supabase (PUBLISHABLE_KEY)
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

/** Sin Supabase configurado el sitio funciona en "modo demo" con contenido de ejemplo. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
