import Link from 'next/link';
import type { IconType } from 'react-icons';
import { FaYoutube, FaPlay, FaDiscord, FaCube, FaGear, FaBookOpen, FaSeedling, FaStar, FaArrowRight, FaChevronRight } from 'react-icons/fa6';
import { HiSun, HiMagnifyingGlass } from 'react-icons/hi2';
import GoldBlock from '@/components/GoldBlock';
import MiniCube from '@/components/MiniCube';
import HeroScene from '@/components/HeroScene';
import CopyButton from '@/components/CopyButton';
import Image from '@/components/SmartImage';
import AdSlot from '@/components/AdSlot';
import { EditionBadges, EmptyState, PostCard, SeedCard, VideoCard } from '@/components/Cards';
import { getFeaturedSeeds, getPosts, getVideos } from '@/lib/data';
import { site } from '@/lib/site';
import { cn, timeAgo } from '@/lib/utils';


function PanelHeader({ Icon, iconClass, title, href, linkLabel = 'Ver todos' }: { Icon: IconType; iconClass: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
      <h2 className="flex items-center gap-3 whitespace-nowrap text-xl font-extrabold tracking-tight text-white 2xl:text-[22px]">
        <Icon className={cn('h-6 w-6 shrink-0', iconClass)} />
        {title}
      </h2>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gold-300 transition hover:gap-2.5 hover:text-gold-100">
          {linkLabel} <FaArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function Particles() {
  // Pequeños cubos dorados flotando alrededor del bloque del banner
  const bits = [
    { l: '-6%', t: '18%', s: 14, d: '0s' },
    { l: '96%', t: '62%', s: 16, d: '1.2s' },
    { l: '88%', t: '4%', s: 10, d: '2s' },
    { l: '2%', t: '78%', s: 10, d: '0.6s' },
    { l: '-12%', t: '48%', s: 8, d: '2.6s' },
  ];
  return (
    <>
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute animate-float bg-gold-400 shadow-[0_0_12px_rgba(249,198,35,0.9)]"
          style={{ left: b.l, top: b.t, width: b.s, height: b.s, animationDelay: b.d, animationDuration: `${4 + i}s` }}
        />
      ))}
    </>
  );
}

export default async function HomePage() {
  const [videos, seeds, posts] = await Promise.all([getVideos({ limit: 9 }), getFeaturedSeeds(7), getPosts({ limit: 6 })]);
  const latest = videos.items[0];
  const featured = seeds[0];

  const explore: { href: string; label: string; icon: React.ReactNode; external?: boolean }[] = [
    { href: site.social.youtube, label: 'Mi canal de YouTube', icon: <FaYoutube className="h-9 w-9 text-[#ff2d2d]" />, external: true },
    { href: '/semillas', label: 'Todas las semillas', icon: <MiniCube accent="grass" size={40} /> },
    { href: '/mods-y-addons', label: 'Mods y Add-ons', icon: <FaGear className="h-8 w-8 text-[#b8c0cc]" /> },
    { href: '/shaders-y-texturas', label: 'Shaders y texturas', icon: <HiSun className="h-9 w-9 text-gold-300" /> },
    { href: '/tutoriales', label: 'Tutoriales', icon: <FaBookOpen className="h-8 w-8 text-[#e9dcc0]" /> },
    { href: site.social.discord, label: 'Discord', icon: <FaDiscord className="h-9 w-9 text-[#7b86ff]" />, external: true },
  ];

  return (
    <>
      {/* ─── BANNER ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <HeroScene className="absolute inset-0 h-full w-full" />
        <div className="container-cubo relative flex min-h-[440px] flex-col items-center justify-center gap-8 pb-24 pt-14 lg:min-h-[480px] lg:flex-row lg:gap-14">
          <div className="relative hidden shrink-0 lg:block">
            <div className="absolute inset-[-25%] rounded-full bg-gold-400/25 blur-3xl" aria-hidden />
            <GoldBlock size={210} className="relative animate-float drop-shadow-[0_0_28px_rgba(249,198,35,0.55)] lg:h-[240px] lg:w-[240px]" />
            <Particles />
          </div>
          <div className="animate-rise text-center">
            <h1 className="hero-title text-[60px] sm:text-[96px] xl:text-[128px]">TodoUnCubo</h1>
            <p className="mt-7 text-2xl font-extrabold tracking-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,.8)] sm:text-[32px]">
              Explora <span className="text-gold-300">Minecraft</span> a tu manera
            </p>
            <p className="mt-3 text-lg text-bone/80 [text-shadow:0_1px_2px_rgba(0,0,0,.8)]">Videos, semillas, mods y mucho más…</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="btn-gold btn-pill !px-7 !py-3 text-base">
                <FaYoutube className="h-5 w-5" /> Suscríbete <FaChevronRight className="h-3.5 w-3.5" />
              </a>
              <form action="/semillas" role="search" className="relative">
                <label htmlFor="hero-q" className="sr-only">Buscar semillas</label>
                <HiMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-bone-dim" />
                <input id="hero-q" name="q" className="input btn-pill !w-64 border-white/15 !bg-ink-950/70 !py-3 pl-11 backdrop-blur" placeholder="Buscar semillas…" />
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="container-cubo relative -mt-16 space-y-10">
        {/* ─── TRES PANELES ───────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Últimos videos */}
          <section className="block-panel p-6">
            <PanelHeader Icon={FaYoutube} iconClass="text-gold-400" title="Últimos videos" href="/videos" />
            {latest ? (
              <div className="grid grid-cols-[1.1fr_1fr] gap-4">
                <Link href={`/videos/${latest.youtube_id}`} className="group relative aspect-video overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10">
                  {latest.thumbnail_url ? (
                    <Image src={latest.thumbnail_url} alt={latest.title} fill sizes="240px" className="object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="pixel-landscape absolute inset-0" />
                  )}
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-10 w-14 place-items-center rounded-xl bg-[#ff2d2d] text-white shadow-lg transition group-hover:scale-110">
                      <FaPlay className="ml-0.5 h-4 w-4" />
                    </span>
                  </span>
                </Link>
                <div className="flex min-w-0 flex-col">
                  <Link href={`/videos/${latest.youtube_id}`} className="line-clamp-3 text-[17px] font-bold leading-snug text-white hover:text-gold-100">{latest.title}</Link>
                  <p className="mt-2 text-sm text-bone-muted">{timeAgo(latest.published_at)}</p>
                  <Link href={`/videos/${latest.youtube_id}`} className="btn-stone mt-auto w-fit !rounded-full !px-4 !py-2">
                    <FaPlay className="h-3 w-3" /> Ver video
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-bone-muted">Los videos del canal aparecerán aquí automáticamente.</p>
            )}
          </section>

          {/* Todo un Cubo (destacado) */}
          <section className="panel-gold flex flex-col items-center justify-center p-7 text-center">
            <span className="absolute left-1/2 top-0 h-1 w-10 -translate-x-1/2 rounded-b bg-gold-300 shadow-[0_0_12px_rgba(255,216,61,0.9)]" aria-hidden />
            <span className="pointer-events-none absolute left-5 top-8 h-3 w-3 bg-gold-500/40" aria-hidden />
            <span className="pointer-events-none absolute bottom-10 right-6 h-3 w-3 bg-gold-500/30" aria-hidden />
            <span className="pointer-events-none absolute left-8 bottom-6 h-2 w-2 bg-gold-500/40" aria-hidden />
            <div className="flex items-center gap-4">
              <GoldBlock size={60} className="drop-shadow-[0_0_14px_rgba(249,198,35,0.6)]" />
              <h2 className="pixel-title text-[38px] tracking-wide text-white">Todo un Cubo</h2>
            </div>
            <p className="mt-4 max-w-xs text-[17px] leading-relaxed text-bone/90">Descubre un espacio con todo lo mejor de Minecraft en un solo lugar.</p>
            <Link href="/todo-un-cubo" className="btn-outline-gold mt-6 !px-8 !py-3 text-base">
              <FaCube className="h-4 w-4 text-gold-300" /> Explorar ahora <FaArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          {/* Semilla destacada */}
          <section className="block-panel p-6">
            <PanelHeader Icon={FaSeedling} iconClass="text-grass" title="Semillas destacadas" href="/semillas" linkLabel="Ver todas" />
            {featured ? (
              <div className="grid grid-cols-[1.1fr_1fr] gap-4">
                <Link href={`/semillas/${featured.slug}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10">
                  {featured.image_url ? (
                    <Image src={featured.image_url} alt={featured.name} fill sizes="240px" className="object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="pixel-landscape absolute inset-0 grid place-items-center"><GoldBlock size={44} /></div>
                  )}
                </Link>
                <div className="flex min-w-0 flex-col gap-2">
                  <Link href={`/semillas/${featured.slug}`} className="line-clamp-2 text-[17px] font-bold leading-snug text-white hover:text-gold-100">{featured.name}</Link>
                  <EditionBadges editions={featured.editions} />
                  <p className="text-xs text-bone-muted">
                    Semilla:<br />
                    <span className="seed-code break-all text-[13px]">{featured.seed_code}</span>
                  </p>
                  <CopyButton value={featured.seed_code} variant="stone" className="mt-auto w-fit !rounded-full !px-4 !py-2" />
                </div>
              </div>
            ) : (
              <p className="text-sm text-bone-muted">Las semillas que publiques desde el panel aparecerán aquí.</p>
            )}
          </section>
        </div>

        {/* ─── EXPLORA MÁS ────────────────────────────────── */}
        <section>
          <h2 className="pixel-title mb-5 flex items-center gap-3 text-[34px] tracking-wide text-white">
            <FaStar className="h-6 w-6 text-gold-400" /> Explora más
          </h2>
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {explore.map((e) => {
                const inner = (
                  <>
                    <span className="transition duration-300 group-hover:-translate-y-1 group-hover:scale-110">{e.icon}</span>
                    <span className="text-[15px] font-bold leading-tight text-white">{e.label}</span>
                  </>
                );
                const cls = 'block-card group flex min-h-[120px] flex-col items-center justify-center gap-3 px-3 py-5 text-center';
                return e.external ? (
                  <a key={e.label} href={e.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                ) : (
                  <Link key={e.label} href={e.href} className={cls}>{inner}</Link>
                );
              })}
            </div>
            <div className="flex items-center gap-5 rounded-2xl border-2 border-white/15 bg-ink-850 p-5 shadow-block">
              <div className="shrink-0 animate-float"><MiniCube accent="grass" size={72} /></div>
              <div>
                <p className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
                  <FaDiscord className="h-5 w-5 text-[#7b86ff]" /> Únete a la comunidad
                </p>
                <p className="mt-1 text-sm text-bone-muted">en Discord y sé parte de TodoUnCubo</p>
                <a href={site.social.discord} target="_blank" rel="noopener noreferrer" className="btn-outline-gold mt-3 !px-5 !py-2">
                  Entrar al server <FaArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <AdSlot />

        {/* ─── MÁS CONTENIDO ──────────────────────────────── */}
        {videos.items.length > 1 && (
          <section className="block-panel p-6">
            <PanelHeader Icon={FaYoutube} iconClass="text-[#ff2d2d]" title="Más videos" href="/videos" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {videos.items.slice(1, 9).map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          </section>
        )}

        {seeds.length > 1 && (
          <section className="block-panel p-6">
            <PanelHeader Icon={FaSeedling} iconClass="text-grass" title="Más semillas" href="/semillas" linkLabel="Ver biblioteca" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {seeds.slice(1, 7).map((s) => <SeedCard key={s.id} seed={s} />)}
            </div>
          </section>
        )}

        <section className="block-panel p-6">
          <PanelHeader Icon={FaBookOpen} iconClass="text-gold-300" title="Últimas publicaciones" href="/publicaciones" />
          {posts.items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.items.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          ) : (
            <EmptyState title="Sin publicaciones todavía" />
          )}
        </section>
      </div>
    </>
  );
}
