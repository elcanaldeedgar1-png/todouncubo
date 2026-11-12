import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/server';
import SeedForm from '@/components/admin/SeedForm';
import { Alert, ConfirmButton } from '@/components/admin/ui';
import { deleteSeed } from '../../../actions';
import type { Seed, Video } from '@/lib/types';

export default async function EditSeed({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; video?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase: sb } = await requireAdmin();
  const isNew = id === 'nueva';

  const [{ data: seed }, { data: videos }] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : sb.from('seeds').select('*, structures:seed_structures(*)').eq('id', id).maybeSingle(),
    sb.from('videos').select('id,title,published_at,youtube_id').order('published_at', { ascending: false }).limit(500),
  ]);
  if (!isNew && !seed) notFound();

  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/admin/semillas" className="text-sm text-bone-muted hover:text-gold-200">← Semillas</Link>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="pixel-title text-3xl text-bone">{isNew ? 'Nueva semilla' : 'Editar semilla'}</h1>
        {!isNew && seed && (
          <div className="flex gap-2">
            <Link href={`/semillas/${seed.slug}`} target="_blank" className="btn-stone">Ver en la web ↗</Link>
            <form action={deleteSeed}>
              <input type="hidden" name="id" value={seed.id} />
              <ConfirmButton message="¿Eliminar esta semilla y todas sus coordenadas? No se puede deshacer.">Eliminar</ConfirmButton>
            </form>
          </div>
        )}
      </header>
      {sp.ok === 'creada' && <Alert>Semilla creada. Ya está visible en la biblioteca.</Alert>}
      <SeedForm seed={seed as Seed | null} defaultVideo={sp.video} videos={(videos ?? []) as Pick<Video, 'id' | 'title' | 'published_at' | 'youtube_id'>[]} />
    </div>
  );
}
