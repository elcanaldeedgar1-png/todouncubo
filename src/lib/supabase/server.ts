import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './env';

/** Cliente con la sesión del usuario (panel de administración). */
export async function sessionClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: el middleware ya refresca la sesión.
        }
      },
    },
  });
}

/**
 * Cliente con service role. SOLO en el servidor (sincronización de YouTube, webhooks).
 * Nunca se importa en componentes de cliente gracias a 'server-only'.
 */
export function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured || !key) throw new Error('Supabase no está configurado (falta SUPABASE_SERVICE_ROLE_KEY).');
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Devuelve el usuario si es administrador; si no, null. */
export async function getAdmin() {
  if (!isSupabaseConfigured) return null;
  const supabase = await sessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  return data ? { user, supabase } : null;
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) {
    throw new Error(
      'Tu sesión del panel se ha cerrado. Abre el panel en otra pestaña, vuelve a entrar y después pulsa guardar otra vez aquí (no se pierde lo que has escrito).',
    );
  }
  return admin;
}
