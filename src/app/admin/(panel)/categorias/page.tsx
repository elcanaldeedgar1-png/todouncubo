import { requireAdmin } from '@/lib/supabase/server';
import { Alert, ConfirmButton, SubmitButton } from '@/components/admin/ui';
import MiniCube from '@/components/MiniCube';
import { deleteCategory, saveCategory } from '../../actions';
import type { Category } from '@/lib/types';

const ACCENTS = [
  ['gold', 'Oro'],
  ['grass', 'Hierba'],
  ['diamond', 'Diamante'],
  ['redstone', 'Redstone'],
  ['stone', 'Piedra'],
];

function CategoryFields({ c }: { c?: Category }) {
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px_90px]">
        <input name="name" required defaultValue={c?.name} className="input" placeholder="Nombre" aria-label="Nombre" />
        <input name="slug" defaultValue={c?.slug} className="input" placeholder="url-amigable" aria-label="URL" />
        <select name="accent" defaultValue={c?.accent ?? 'gold'} className="input" aria-label="Color">
          {ACCENTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <input name="sort_order" type="number" defaultValue={c?.sort_order ?? 0} className="input" aria-label="Orden" title="Orden" />
      </div>
      <input name="description" defaultValue={c?.description ?? ''} className="input" placeholder="Descripción corta" aria-label="Descripción" />
      <div>
        <input name="video_keywords" defaultValue={c?.video_keywords.join(', ')} className="input" placeholder="Palabras clave para clasificar videos: shader, texturas, resource pack" aria-label="Palabras clave" />
        <p className="mt-1 text-xs text-bone-dim">Si el título de un video nuevo contiene alguna de estas palabras, se asigna a esta sección automáticamente.</p>
      </div>
    </>
  );
}

export default async function AdminCategories({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase: sb } = await requireAdmin();
  const { data } = await sb.from('categories').select('*').order('sort_order');
  const cats = (data ?? []) as Category[];

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="pixel-title text-3xl text-bone">Categorías</h1>
        <p className="mt-1 text-sm text-bone-muted">Cada categoría tiene su propia página pública (todouncubo.com/<em>url</em>) y aparece en la portada.</p>
      </header>
      {sp.ok && <Alert>Cambios guardados.</Alert>}
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      {cats.map((c) => (
        <div key={c.id} className="block-panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <MiniCube accent={c.accent} size={32} />
            <p className="font-semibold text-bone">{c.name}</p>
            <span className="text-xs text-bone-dim">/{c.slug}</span>
          </div>
          <form action={saveCategory} className="space-y-3">
            <CategoryFields c={c} />
            <div className="flex justify-end"><SubmitButton className="!py-2">Guardar</SubmitButton></div>
          </form>
          <form action={deleteCategory} className="mt-2 flex justify-end">
            <input type="hidden" name="id" value={c.id} />
            <ConfirmButton className="!py-1.5 !text-xs" message={`¿Eliminar la categoría “${c.name}”? Solo es posible si no tiene publicaciones.`}>Eliminar</ConfirmButton>
          </form>
        </div>
      ))}

      <div className="block-panel border-dashed p-5">
        <p className="mb-4 font-semibold text-bone">Nueva categoría</p>
        <form action={saveCategory} className="space-y-3">
          <CategoryFields />
          <div className="flex justify-end"><SubmitButton className="!py-2">Crear categoría</SubmitButton></div>
        </form>
      </div>
    </div>
  );
}
