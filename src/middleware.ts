import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/** Refresca la sesión de Supabase y protege /admin. */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isLogin = request.nextUrl.pathname.startsWith('/admin/login');

  if (!url || !key) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL('/admin/login', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Envíos de formularios del panel (Server Actions): no redirigir, porque el formulario no sabe
  // seguir una redirección y mostraba «Application error». Cada acción comprueba la sesión
  // (requireAdmin) y devuelve un aviso claro sin perder lo escrito.
  const isServerAction = request.method === 'POST' && request.headers.has('next-action');
  if (!user && !isLogin && isServerAction) return response;

  if (!user && !isLogin) {
    const to = new URL('/admin/login', request.url);
    to.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(to);
  }
  // (con ?error=no-admin dejamos ver el login para evitar un bucle si la cuenta no es admin)
  if (user && isLogin && !request.nextUrl.searchParams.has('error')) return NextResponse.redirect(new URL('/admin', request.url));

  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
