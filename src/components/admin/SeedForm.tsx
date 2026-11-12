'use client';
import { useActionState, useState } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiChevronUp, HiChevronDown } from 'react-icons/hi2';
import { saveSeed } from '@/app/admin/actions';
import { STRUCTURES } from '@/lib/structures';
import { slugify } from '@/lib/utils';
import type { Seed, SeedStructure, Video } from '@/lib/types';
import { Alert, PendingButton, useNoResetSubmit } from './ui';
import ImageField from './ImageField';

type Row = Omit<SeedStructure, 'id' | 'seed_id' | 'sort_order' | 'x' | 'y' | 'z'> & { key: string; x: string; y: string; z: string };

const toLocal = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function SeedForm({
  seed,
  videos,
  defaultVideo,
}: {
  seed: Seed | null;
  videos: Pick<Video, 'id' | 'title' | 'published_at' | 'youtube_id'>[];
  defaultVideo?: string;
}) {
  const [state, action, pending] = useActionState(saveSeed, undefined);
  const onSubmit = useNoResetSubmit(action);
  const [name, setName] = useState(seed?.name ?? '');
  const [slug, setSlug] = useState(seed?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(seed));
  const [rows, setRows] = useState<Row[]>(
    [...(seed?.structures ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s, i) => ({ key: `r${i}`, type: s.type, name: s.name, x: String(s.x), y: s.y == null ? '' : String(s.y), z: String(s.z), dimension: s.dimension, notes: s.notes })),
  );

  const update = (key: string, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const n = [...r];
      const j = i + d;
      if (j < 0 || j >= n.length) return r;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const addRow = () => setRows((r) => [...r, { key: crypto.randomUUID(), type: 'village', name: '', x: '', y: '', z: '', dimension: 'overworld', notes: '' }]);

  const structuresJson = JSON.stringify(
    rows
      .filter((r) => r.x !== '' && r.z !== '')
      .map((r) => ({ type: r.type, name: r.name || null, x: Number(r.x), y: r.y === '' ? null : Number(r.y), z: Number(r.z), dimension: r.dimension, notes: r.notes || null })),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      {seed && <input type="hidden" name="id" value={seed.id} />}
      <input type="hidden" name="structures" value={structuresJson} />

      <section className="block-panel grid gap-5 p-6 md:grid-cols-2">
        <h2 className="font-semibold text-bone md:col-span-2">Datos de la semilla</h2>
        <div className="md:col-span-2">
          <label className="label" htmlFor="name">Nombre *</label>
          <input
            id="name"
            name="name"
            required
            className="input"
            value={name}
            placeholder="Ej: Aldea gigante junto a un templo del desierto"
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div>
          <label className="label" htmlFor="seed_code">Código de la semilla *</label>
          <input id="seed_code" name="seed_code" required defaultValue={seed?.seed_code} className="input font-mono" placeholder="-1234567890123" />
        </div>
        <div>
          <label className="label" htmlFor="mc_version">Versión de Minecraft *</label>
          <input id="mc_version" name="mc_version" required defaultValue={seed?.mc_version ?? ''} className="input" placeholder="1.21.4" />
        </div>
        <fieldset>
          <legend className="label">Edición *</legend>
          <div className="flex gap-4">
            {(['java', 'bedrock'] as const).map((e) => (
              <label key={e} className="flex items-center gap-2 text-sm text-bone">
                <input type="checkbox" name="editions" value={e} defaultChecked={seed ? seed.editions.includes(e) : e === 'java'} className="h-4 w-4 accent-[#f9c623]" />
                {e === 'java' ? 'Java' : 'Bedrock'}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="label" htmlFor="slug">URL amigable</label>
          <div className="flex items-center gap-1 text-sm text-bone-dim">
            <span>/semillas/</span>
            <input
              id="slug"
              name="slug"
              className="input"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="description">Descripción: ¿qué contiene?</label>
          <textarea id="description" name="description" rows={5} defaultValue={seed?.description ?? ''} className="input" placeholder="Apareces junto a una aldea con herrería, a 300 bloques hay una mansión…" />
        </div>
        <div className="md:col-span-2">
          <ImageField name="image" currentName="image_url" current={seed?.image_url} label="Imagen o captura del mundo" />
        </div>
      </section>

      <section className="block-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-bone">Estructuras y coordenadas</h2>
            <p className="text-xs text-bone-dim">Aldeas, herrerías, mansiones, templos, ciudades antiguas… La Y es opcional.</p>
          </div>
          <button type="button" onClick={addRow} className="btn-stone !py-2"><HiOutlinePlus className="h-4 w-4" /> Añadir</button>
        </div>
        {rows.length === 0 && <p className="rounded-lg border border-dashed border-ink-500 p-6 text-center text-sm text-bone-muted">Sin estructuras todavía.</p>}
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.key} className="grid grid-cols-2 gap-2 rounded-lg border border-ink-600 bg-ink-900 p-3 sm:grid-cols-12">
              <select aria-label="Tipo" value={r.type} onChange={(e) => update(r.key, { type: e.target.value })} className="input col-span-2 sm:col-span-3">
                {Object.entries(STRUCTURES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input aria-label="Nombre (opcional)" placeholder="Nombre (opcional)" value={r.name ?? ''} onChange={(e) => update(r.key, { name: e.target.value })} className="input col-span-2 sm:col-span-3" />
              <input aria-label="X" placeholder="X" inputMode="numeric" value={r.x} onChange={(e) => update(r.key, { x: e.target.value.replace(/[^-\d]/g, '') })} className="input font-mono sm:col-span-1" required />
              <input aria-label="Y" placeholder="Y" inputMode="numeric" value={r.y} onChange={(e) => update(r.key, { y: e.target.value.replace(/[^-\d]/g, '') })} className="input font-mono sm:col-span-1" />
              <input aria-label="Z" placeholder="Z" inputMode="numeric" value={r.z} onChange={(e) => update(r.key, { z: e.target.value.replace(/[^-\d]/g, '') })} className="input font-mono sm:col-span-1" required />
              <select aria-label="Dimensión" value={r.dimension} onChange={(e) => update(r.key, { dimension: e.target.value as Row['dimension'] })} className="input sm:col-span-2">
                <option value="overworld">Overworld</option>
                <option value="nether">Nether</option>
                <option value="end">End</option>
              </select>
              <div className="col-span-2 flex items-center justify-end gap-1 sm:col-span-1">
                <button type="button" onClick={() => move(i, -1)} className="btn-ghost !p-1.5" aria-label="Subir"><HiChevronUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} className="btn-ghost !p-1.5" aria-label="Bajar"><HiChevronDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))} className="btn-ghost !p-1.5 text-[#ff8b80]" aria-label="Quitar"><HiOutlineTrash className="h-4 w-4" /></button>
              </div>
              <input aria-label="Notas" placeholder="Notas (opcional): p. ej. tiene cofre con diamantes" value={r.notes ?? ''} onChange={(e) => update(r.key, { notes: e.target.value })} className="input col-span-2 sm:col-span-12" />
            </div>
          ))}
        </div>
      </section>

      <section className="block-panel grid gap-5 p-6 md:grid-cols-2">
        <h2 className="font-semibold text-bone md:col-span-2">Publicación</h2>
        <div className="md:col-span-2">
          <label className="label" htmlFor="video_id">Video de YouTube relacionado</label>
          <select id="video_id" name="video_id" defaultValue={seed?.video_id ?? defaultVideo ?? ''} className="input">
            <option value="">— Sin video —</option>
            {videos.map((v) => (
              <option key={v.id} value={v.id}>{new Date(v.published_at).toLocaleDateString('es-ES')} · {v.title}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-bone-dim">Los videos se importan solos desde tu canal. Aquí solo eliges cuál corresponde a esta semilla.</p>
        </div>
        <div>
          <label className="label" htmlFor="status">Estado</label>
          <select id="status" name="status" defaultValue={seed?.status ?? 'published'} className="input">
            <option value="published">Publicada</option>
            <option value="draft">Borrador (oculta)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="published_at">Fecha de publicación</label>
          <input id="published_at" name="published_at" type="datetime-local" defaultValue={toLocal(seed?.published_at)} className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm text-bone md:col-span-2">
          <input type="checkbox" name="is_featured" defaultChecked={seed?.is_featured} className="h-4 w-4 accent-[#f9c623]" />
          ★ Destacar en la página principal
        </label>
        <details className="md:col-span-2">
          <summary className="cursor-pointer text-sm font-semibold text-bone-muted hover:text-gold-200">SEO (opcional)</summary>
          <div className="mt-4 grid gap-4">
            <input name="seo_title" defaultValue={seed?.seo_title ?? ''} className="input" placeholder="Título para Google (se genera solo si lo dejas vacío)" maxLength={70} />
            <textarea name="seo_description" defaultValue={seed?.seo_description ?? ''} className="input" rows={2} placeholder="Descripción para Google (máx. 160 caracteres)" maxLength={160} />
          </div>
        </details>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <PendingButton pending={pending} className="!px-8 !py-3 shadow-gold">{seed ? 'Guardar cambios' : 'Publicar semilla'}</PendingButton>
      </div>
    </form>
  );
}
