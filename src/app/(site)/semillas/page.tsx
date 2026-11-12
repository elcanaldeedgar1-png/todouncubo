import type { Metadata } from 'next';
import Link from 'next/link';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import PageHero from '@/components/PageHero';
import Pagination from '@/components/Pagination';
import AdSlot from '@/components/AdSlot';
import { EmptyState, SeedCard } from '@/components/Cards';
import { searchSeeds } from '@/lib/data';
import { STRUCTURE_FILTERS } from '@/lib/structures';
import { cn } from '@/lib/utils';

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  return {
    title: 'Biblioteca de semillas de Minecraft',
    description: 'Todas las semillas de Minecraft de TrexxCraft para Java y Bedrock, con coordenadas de aldeas, herrerías, mansiones, templos, ciudades antiguas y más.',
    alternates: { canonical: '/semillas' },
    // Las combinaciones de filtros no se indexan para evitar contenido duplicado
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function SeedsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = one(sp.q);
  const edicion = one(sp.edicion);
  const estructura = one(sp.estructura);
  const orden = one(sp.orden) as 'recientes' | 'antiguas' | 'nombre' | undefined;
  const page = Number(one(sp.pagina)) || 1;

  const result = await searchSeeds({ q, edition: edicion, structure: estructura, sort: orden, page });
  const params = { q, edicion, estructura, orden };

  const link = (patch: Record<string, string | undefined>) => {
    const next = { ...params, ...patch };
    const s = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && s.set(k, v));
    const qs = s.toString();
    return qs ? `/semillas?${qs}` : '/semillas';
  };

  return (
    <>
      <PageHero
        eyebrow="Biblioteca"
        title="Semillas de Minecraft"
        description="Todas las semillas de mis videos con su código, versión, edición y coordenadas de las estructuras importantes."
        crumbs={[{ href: '/semillas', label: 'Semillas' }]}
      >
        <form action="/semillas" className="flex max-w-2xl gap-2" role="search">
          {edicion && <input type="hidden" name="edicion" value={edicion} />}
          {estructura && <input type="hidden" name="estructura" value={estructura} />}
          <label htmlFor="q" className="sr-only">Buscar por nombre, número o estructura</label>
          <div className="relative flex-1">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-bone-dim" />
            <input id="q" name="q" defaultValue={q} className="input !py-3 pl-11" placeholder="Nombre, número de semilla o estructura…" />
          </div>
          <button className="btn-gold">Buscar</button>
        </form>
      </PageHero>

      <div className="container-cubo grid gap-8 py-10 lg:grid-cols-[250px_1fr]">
        {/* Filtros */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Filtros">
          <div>
            <p className="label">Edición</p>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {[{ k: undefined, l: 'Todas' }, { k: 'java', l: 'Minecraft Java' }, { k: 'bedrock', l: 'Minecraft Bedrock' }].map((o) => (
                <Link key={o.l} href={link({ edicion: o.k, pagina: undefined })} className={cn('chip !py-1.5', edicion === o.k && 'chip-active')}>
                  {o.l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Estructuras</p>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              <Link href={link({ estructura: undefined })} className={cn('chip !py-1.5', !estructura && 'chip-active')}>Todas</Link>
              {STRUCTURE_FILTERS.map((f) => (
                <Link key={f.key} href={link({ estructura: f.key })} className={cn('chip !py-1.5', estructura === f.key && 'chip-active')}>
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Ordenar</p>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {[{ k: undefined, l: 'Más recientes' }, { k: 'antiguas', l: 'Más antiguas' }, { k: 'nombre', l: 'Nombre A–Z' }].map((o) => (
                <Link key={o.l} href={link({ orden: o.k })} className={cn('chip !py-1.5', orden === o.k && 'chip-active')}>{o.l}</Link>
              ))}
            </div>
          </div>
          <AdSlot variant="sidebar" className="hidden lg:block" />
        </aside>

        <section aria-live="polite">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-bone-muted">
            <p>
              <strong className="text-bone">{result.total}</strong> {result.total === 1 ? 'semilla' : 'semillas'}
              {q && <> para «<span className="text-gold-200">{q}</span>»</>}
            </p>
            {(q || edicion || estructura || orden) && <Link href="/semillas" className="text-gold-300 hover:text-gold-100">Limpiar filtros ×</Link>}
          </div>
          {result.items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((s, i) => <SeedCard key={s.id} seed={s} priority={i < 3} />)}
            </div>
          ) : (
            <EmptyState title="No encontramos semillas con esos filtros" text="Prueba con otra palabra o quita algún filtro." />
          )}
          <Pagination page={result.page} total={result.total} pageSize={result.pageSize} basePath="/semillas" params={params} />
        </section>
      </div>
    </>
  );
}
