import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import GoldBlock from '@/components/GoldBlock';
import { getAdmin } from '@/lib/supabase/server';
import { logout } from '../actions';
import AdminNav from './AdminNav';

export const metadata: Metadata = { title: 'Panel', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  // Sesión iniciada pero sin permisos de administrador (o Supabase sin configurar)
  if (!admin) redirect('/admin/login?error=no-admin');

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-ink-600 bg-ink-900 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <GoldBlock size={32} />
          <div>
            <p className="pixel-title text-sm leading-none text-gold-gradient">TodoUnCubo</p>
            <p className="mt-1 text-[11px] text-bone-dim">Panel de administración</p>
          </div>
        </div>
        <AdminNav />
        <div className="flex flex-wrap items-center gap-1 px-3 pb-4 lg:absolute lg:bottom-0 lg:block lg:w-full lg:pb-5">
          <Link href="/" target="_blank" className="btn-ghost w-full justify-start !px-3 !text-xs">
            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" /> Ver el sitio
          </Link>
          <p className="truncate px-3 pt-2 text-[11px] text-bone-dim">{admin.user.email}</p>
          <form action={logout}>
            <button className="btn-ghost w-full justify-start !px-3 !text-xs">Cerrar sesión</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
