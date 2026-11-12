import type { Metadata } from 'next';
import LoginForm from './LoginForm';
import GoldBlock from '@/components/GoldBlock';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const metadata: Metadata = { title: 'Acceso al panel', robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <GoldBlock size={72} glow className="animate-float" />
          <h1 className="pixel-title mt-5 text-xl text-gold-gradient">TodoUnCubo</h1>
          <p className="mt-1 text-sm text-bone-muted">Panel de administración</p>
        </div>
        <div className="block-panel p-6">
          <LoginForm next={sp.next} configured={isSupabaseConfigured} notAdmin={sp.error === 'no-admin'} />
        </div>
      </div>
    </div>
  );
}
