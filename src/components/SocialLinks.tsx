import { FaDiscord, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

export const SOCIALS = [
  { key: 'youtube', label: 'YouTube', handle: 'TrexxCraft', href: site.social.youtube, Icon: FaYoutube, color: '#ff3b30', cta: 'Suscribirme' },
  { key: 'tiktok', label: 'TikTok', handle: '@trexxcraft', href: site.social.tiktok, Icon: FaTiktok, color: '#25f4ee', cta: 'Seguir' },
  { key: 'instagram', label: 'Instagram', handle: '@trexxcraft', href: site.social.instagram, Icon: FaInstagram, color: '#e1306c', cta: 'Seguir' },
  { key: 'discord', label: 'Discord', handle: 'Comunidad', href: site.social.discord, Icon: FaDiscord, color: '#5865f2', cta: 'Unirme' },
] as const;

export function SocialIcons({ className }: { className?: string }) {
  return (
    <ul className={cn('flex items-center gap-2', className)}>
      {SOCIALS.map(({ key, label, href, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} de TrexxCraft`}
            className="grid h-10 w-10 place-items-center rounded-lg border border-ink-500 bg-ink-800 text-bone-muted shadow-block transition hover:-translate-y-0.5 hover:border-gold-400/60 hover:text-gold-200"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SocialCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SOCIALS.map(({ key, label, handle, href, Icon, color, cta }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block-card group relative overflow-hidden p-5"
          style={{ ['--brand' as string]: color }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
            style={{ background: color }}
          />
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-ink-900 shadow-block" style={{ color }}>
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-bone">{label}</p>
              <p className="truncate text-sm text-bone-muted">{handle}</p>
            </div>
          </div>
          <span className="mt-4 inline-flex text-sm font-semibold text-gold-300 transition group-hover:translate-x-1">{cta} →</span>
        </a>
      ))}
    </div>
  );
}
