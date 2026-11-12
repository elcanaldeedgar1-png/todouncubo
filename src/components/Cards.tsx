import Image from '@/components/SmartImage';
import Link from 'next/link';
import { FaPlay } from 'react-icons/fa6';
import GoldBlock from './GoldBlock';
import type { Post, Seed, Video } from '@/lib/types';
import { EDITION_LABEL, STRUCTURES, structureLabel } from '@/lib/structures';
import { ACCENT_CLASSES, cn, formatDate, truncate } from '@/lib/utils';

export function EditionBadges({ editions }: { editions: string[] }) {
  return (
    <div className="flex gap-1.5">
      {editions.map((e) => (
        <span
          key={e}
          className={cn(
            'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            e === 'java' ? 'bg-[#e76f3c]/15 text-[#ff9a6c] ring-1 ring-[#e76f3c]/40' : 'bg-[#4fa3e7]/15 text-[#8cc8ff] ring-1 ring-[#4fa3e7]/40',
          )}
        >
          {EDITION_LABEL[e as keyof typeof EDITION_LABEL] ?? e}
        </span>
      ))}
    </div>
  );
}

function Placeholder({ label }: { label?: string }) {
  return (
    <div className="pixel-landscape absolute inset-0 grid place-items-center">
      <GoldBlock size={56} className="opacity-90 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

export function SeedCard({ seed, priority = false }: { seed: Seed; priority?: boolean }) {
  return (
    <Link href={`/semillas/${seed.slug}`} className="block-card group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-800">
        {seed.image_url ? (
          <Image
            src={seed.image_url}
            alt={`Captura del mundo de la semilla ${seed.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <Placeholder />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950/90 to-transparent" />
        <div className="absolute left-3 top-3"><EditionBadges editions={seed.editions} /></div>
        <span className="absolute right-3 top-3 rounded bg-ink-950/80 px-2 py-0.5 font-pixel text-[10px] text-gold-200 ring-1 ring-gold-400/30">
          {seed.mc_version}
        </span>
        {seed.is_featured && (
          <span className="absolute bottom-3 left-3 rounded bg-gold-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-950">
            Destacada
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-bone group-hover:text-gold-100">{seed.name}</h3>
        <p className="seed-code truncate rounded-md border border-ink-600 bg-ink-900 px-2.5 py-1.5 text-xs">{seed.seed_code}</p>
        {seed.structure_types.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5">
            {seed.structure_types.slice(0, 4).map((t) => (
              <li key={t} className="chip !px-2 !py-0.5 !text-[11px]">
                <span className="h-2 w-2 rounded-[2px]" style={{ background: STRUCTURES[t]?.color }} />
                {structureLabel(t)}
              </li>
            ))}
            {seed.structure_types.length > 4 && <li className="chip !px-2 !py-0.5 !text-[11px]">+{seed.structure_types.length - 4}</li>}
          </ul>
        )}
      </div>
    </Link>
  );
}

export function VideoCard({ video, priority = false }: { video: Video; priority?: boolean }) {
  const accent = ACCENT_CLASSES[video.category?.accent ?? 'gold'];
  return (
    <Link href={`/videos/${video.youtube_id}`} className="block-card group flex flex-col overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-ink-800">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <Placeholder />
        )}
        <span className="absolute inset-0 grid place-items-center bg-ink-950/0 transition group-hover:bg-ink-950/30">
          <span className="grid h-12 w-12 scale-90 place-items-center rounded-lg bg-[#ff2d2d] text-white opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
            <FaPlay className="ml-0.5 h-4 w-4" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {video.category && (
          <span className={cn('w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', accent.bg, accent.text)}>
            {video.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-bone group-hover:text-gold-100">{video.title}</h3>
        <time className="mt-auto text-xs text-bone-dim" dateTime={video.published_at}>{formatDate(video.published_at)}</time>
      </div>
    </Link>
  );
}

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  const accent = ACCENT_CLASSES[post.category?.accent ?? 'gold'];
  return (
    <Link href={`/${post.category?.slug}/${post.slug}`} className="block-card group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-800">
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <Placeholder />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {post.category && (
          <span className={cn('w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', accent.bg, accent.text)}>
            {post.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 font-semibold leading-snug text-bone group-hover:text-gold-100">{post.title}</h3>
        {post.excerpt && <p className="line-clamp-2 text-sm text-bone-muted">{truncate(post.excerpt, 140)}</p>}
        <time className="mt-auto pt-1 text-xs text-bone-dim" dateTime={post.published_at}>{formatDate(post.published_at)}</time>
      </div>
    </Link>
  );
}

export function SectionHeader({ eyebrow, title, href, linkLabel = 'Ver todo' }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="pixel-title text-2xl text-bone sm:text-[28px]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-gold-300 transition hover:text-gold-100">
          <span className="text-sm font-bold">{linkLabel} →</span>
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="block-panel flex flex-col items-center gap-3 px-6 py-14 text-center">
      <GoldBlock size={48} className="opacity-70" />
      <p className="font-semibold text-bone">{title}</p>
      {text && <p className="max-w-md text-sm text-bone-muted">{text}</p>}
    </div>
  );
}
