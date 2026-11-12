import type { Metadata } from 'next';
import Image from '@/components/SmartImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaYoutube } from 'react-icons/fa6';
import CopyButton from '@/components/CopyButton';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import JsonLd from '@/components/JsonLd';
import AdSlot from '@/components/AdSlot';
import GoldBlock from '@/components/GoldBlock';
import { EditionBadges, SeedCard } from '@/components/Cards';
import { getSeedBySlug, searchSeeds } from '@/lib/data';
import { absoluteUrl, site } from '@/lib/site';
import { DIMENSION_LABEL, EDITION_LABEL, STRUCTURES, structureLabel } from '@/lib/structures';
import { formatDate, truncate } from '@/lib/utils';


type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const seed = await getSeedBySlug(slug);
  if (!seed) return { title: 'Semilla no encontrada', robots: { index: false } };
  const editions = seed.editions.map((e) => EDITION_LABEL[e]).join(' y ');
  const title = seed.seo_title || `${seed.name} — Semilla de Minecraft ${editions} ${seed.mc_version}`;
  const description =
    seed.seo_description ||
    truncate(`Semilla ${seed.seed_code} para Minecraft ${editions} ${seed.mc_version}. ${seed.description ?? ''} Coordenadas de ${seed.structure_types.map(structureLabel).join(', ')}.`, 158);
  return {
    title,
    description,
    alternates: { canonical: `/semillas/${seed.slug}` },
    openGraph: { type: 'article', title, description, url: absoluteUrl(`/semillas/${seed.slug}`), images: seed.image_url ? [{ url: seed.image_url }] : undefined, publishedTime: seed.published_at, modifiedTime: seed.updated_at },
  };
}

export default async function SeedPage({ params }: { params: Params }) {
  const { slug } = await params;
  const seed = await getSeedBySlug(slug);
  if (!seed) notFound();

  const structures = seed.structures ?? [];
  const related = (await searchSeeds({ pageSize: 4 })).items.filter((s) => s.id !== seed.id).slice(0, 3);
  const counts = structures.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.type]: (acc[s.type] ?? 0) + 1 }), {});

  return (
    <article className="container-cubo py-10">
      <nav aria-label="Migas de pan" className="mb-6 text-xs text-bone-dim">
        <Link href="/" className="hover:text-gold-200">Inicio</Link> / <Link href="/semillas" className="hover:text-gold-200">Semillas</Link> / <span className="text-bone-muted">{seed.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-8">
          <header className="animate-rise">
            <div className="flex flex-wrap items-center gap-3">
              <EditionBadges editions={seed.editions} />
              <span className="chip">Versión {seed.mc_version}</span>
              <time className="text-xs text-bone-dim" dateTime={seed.published_at}>Publicada el {formatDate(seed.published_at)}</time>
            </div>
            <h1 className="pixel-title mt-4 text-3xl text-bone sm:text-4xl">{seed.name}</h1>
          </header>

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-ink-600 bg-ink-800 shadow-block">
            {seed.image_url ? (
              <Image src={seed.image_url} alt={`Captura del mundo de ${seed.name}`} fill priority sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" />
            ) : (
              <div className="pixel-landscape absolute inset-0 grid place-items-center"><GoldBlock size={96} /></div>
            )}
          </div>

          {seed.description && (
            <section>
              <h2 className="pixel-title mb-4 text-xl sm:text-2xl text-gold-200">¿Qué contiene esta semilla?</h2>
              <p className="whitespace-pre-line leading-7 text-bone/90">{seed.description}</p>
            </section>
          )}

          {structures.length > 0 && (
            <section>
              <h2 className="pixel-title mb-4 text-xl sm:text-2xl text-gold-200">Coordenadas de estructuras</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {Object.entries(counts).map(([type, n]) => (
                  <span key={type} className="chip">
                    <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: STRUCTURES[type]?.color }} />
                    {structureLabel(type)} × {n}
                  </span>
                ))}
              </div>
              <div className="overflow-x-auto rounded-xl border border-ink-600 bg-ink-850 shadow-block">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-ink-800 text-left text-xs uppercase tracking-wider text-bone-muted">
                    <tr>
                      <th className="px-4 py-3">Estructura</th>
                      <th className="px-4 py-3 text-right">X</th>
                      <th className="px-4 py-3 text-right">Y</th>
                      <th className="px-4 py-3 text-right">Z</th>
                      <th className="px-4 py-3">Dimensión</th>
                      <th className="px-4 py-3"><span className="sr-only">Copiar</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.map((s, i) => {
                      const tp = `/tp @s ${s.x} ${s.y ?? '~'} ${s.z}`;
                      return (
                        <tr key={s.id ?? i} className="border-t border-ink-700 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: STRUCTURES[s.type]?.color }} />
                              <div>
                                <p className="font-medium text-bone">{s.name || structureLabel(s.type)}</p>
                                {(s.name || s.notes) && <p className="text-xs text-bone-dim">{s.name ? structureLabel(s.type) : ''}{s.notes ? `${s.name ? ' · ' : ''}${s.notes}` : ''}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-gold-100">{s.x}</td>
                          <td className="px-4 py-3 text-right font-mono text-bone-muted">{s.y ?? '—'}</td>
                          <td className="px-4 py-3 text-right font-mono text-gold-100">{s.z}</td>
                          <td className="px-4 py-3 text-bone-muted">{DIMENSION_LABEL[s.dimension]}</td>
                          <td className="px-4 py-3 text-right">
                            <CopyButton value={tp} label="/tp" className="!px-2.5 !py-1 !text-xs" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {seed.video && (
            <section>
              <h2 className="pixel-title mb-4 text-xl sm:text-2xl text-gold-200">Video de la semilla</h2>
              <YouTubeEmbed id={seed.video.youtube_id} title={seed.video.title} />
            </section>
          )}

          <AdSlot />
        </div>

        {/* Ficha lateral */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="block-panel p-5">
            <p className="label">Código de la semilla</p>
            <p className="seed-code break-all rounded-lg border border-gold-500/30 bg-ink-950 px-4 py-3 text-lg">{seed.seed_code}</p>
            <CopyButton value={seed.seed_code} className="mt-4 w-full !py-3" />
            {seed.video && (
              <a href={seed.video.url} target="_blank" rel="noopener noreferrer" className="btn-stone mt-3 w-full !py-3">
                <FaYoutube className="h-4 w-4 text-[#ff3b30]" /> Ver el video
              </a>
            )}
          </div>
          <dl className="block-panel divide-y divide-ink-700 text-sm">
            {[
              ['Versión', seed.mc_version],
              ['Edición', seed.editions.map((e) => EDITION_LABEL[e]).join(' · ')],
              ['Estructuras', String(structures.length)],
              ['Publicada', formatDate(seed.published_at)],
              ['Actualizada', formatDate(seed.updated_at)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-bone-muted">{k}</dt>
                <dd className="text-right font-medium text-bone">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="pixel-title mb-6 text-2xl sm:text-3xl text-bone">Más semillas</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => <SeedCard key={s.id} seed={s} />)}
          </div>
        </section>
      )}

      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: seed.name,
            description: truncate(seed.description, 300),
            image: seed.image_url ?? undefined,
            datePublished: seed.published_at,
            dateModified: seed.updated_at,
            author: { '@type': 'Person', name: site.creator },
            publisher: { '@type': 'Organization', name: site.shortName, logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') } },
            mainEntityOfPage: absoluteUrl(`/semillas/${seed.slug}`),
            keywords: ['semilla Minecraft', seed.mc_version, ...seed.editions, ...seed.structure_types.map(structureLabel)].join(', '),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'Semillas', item: absoluteUrl('/semillas') },
              { '@type': 'ListItem', position: 3, name: seed.name, item: absoluteUrl(`/semillas/${seed.slug}`) },
            ],
          },
          ...(seed.video
            ? [{
                '@context': 'https://schema.org',
                '@type': 'VideoObject',
                name: seed.video.title,
                thumbnailUrl: seed.video.thumbnail_url ?? undefined,
                uploadDate: seed.video.published_at,
                embedUrl: `https://www.youtube.com/embed/${seed.video.youtube_id}`,
                contentUrl: seed.video.url,
                description: truncate(seed.description || seed.video.title, 300),
              }]
            : []),
        ]}
      />
    </article>
  );
}
