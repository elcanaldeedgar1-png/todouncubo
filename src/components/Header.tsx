'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { FaCube, FaDiscord, FaInstagram, FaPuzzlePiece, FaYoutube, FaBookOpen } from 'react-icons/fa6';
import { HiBars3, HiXMark, HiHome, HiSun, HiNewspaper } from 'react-icons/hi2';
import GoldBlock from './GoldBlock';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

const ITEMS: { href: string; label: string; Icon: IconType; wide?: boolean }[] = [
  { href: '/', label: 'Inicio', Icon: HiHome },
  { href: '/videos', label: 'Videos', Icon: FaYoutube },
  { href: '/semillas', label: 'Semillas', Icon: FaCube },
  { href: '/mods-y-addons', label: 'Mods', Icon: FaPuzzlePiece },
  { href: '/shaders-y-texturas', label: 'Shaders', Icon: HiSun },
  { href: '/tutoriales', label: 'Tutoriales', Icon: FaBookOpen, wide: true },
  { href: '/novedades', label: 'Novedades', Icon: HiNewspaper, wide: true },
];

const SOCIAL = [
  { href: site.social.youtube, label: 'YouTube', Icon: FaYoutube },
  { href: site.social.discord, label: 'Discord', Icon: FaDiscord },
  { href: site.social.instagram, label: 'Instagram', Icon: FaInstagram },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
  const cuboActive = isActive('/todo-un-cubo');

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled ? 'border-white/10 bg-ink-950/90 backdrop-blur-xl' : 'border-white/5 bg-ink-950/70 backdrop-blur-md',
      )}
    >
      <div className="container-cubo flex h-[72px] items-center gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="TodoUnCubo — inicio">
          <GoldBlock size={44} className="drop-shadow-[0_0_12px_rgba(249,198,35,0.45)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
          <span className="pixel-title whitespace-nowrap text-[26px] !leading-none text-white">TodoUnCubo</span>
        </Link>

        <nav className="ml-6 hidden h-full items-center gap-1 xl:flex" aria-label="Principal">
          {ITEMS.map(({ href, label, Icon, wide }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-full items-center gap-2 whitespace-nowrap px-3 text-[15px] font-semibold transition',
                  active ? 'text-gold-300' : 'text-bone/85 hover:text-white',
                  wide && 'hidden 2xl:flex',
                )}
              >
                <Icon className={cn('h-[18px] w-[18px]', active ? 'text-gold-300' : 'text-bone/70')} />
                {label}
                {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-gold-400 shadow-[0_0_10px_rgba(249,198,35,0.8)]" />}
              </Link>
            );
          })}
          <Link
            href="/todo-un-cubo"
            className={cn(
              'ml-2 flex items-center gap-2 whitespace-nowrap rounded-xl border-2 border-gold-400 px-4 py-2 text-[15px] font-semibold text-white transition hover:bg-gold-400/10',
              cuboActive ? 'bg-gold-400/15 shadow-[0_0_20px_-4px_rgba(249,198,35,0.8)]' : 'shadow-[0_0_14px_-6px_rgba(249,198,35,0.7)]',
            )}
          >
            <FaCube className="h-4 w-4 text-gold-300" /> Todo un Cubo
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="hidden items-center sm:flex">
            {SOCIAL.map(({ href, label, Icon }, i) => (
              <span key={label} className="flex items-center">
                {i === 1 && <span className="mx-1 h-6 w-px bg-white/20" aria-hidden />}
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} de TodoUnCubo`} className="grid h-10 w-10 place-items-center rounded-lg text-bone/85 transition hover:bg-white/5 hover:text-gold-200">
                  <Icon className="h-[22px] w-[22px]" />
                </a>
              </span>
            ))}
          </div>
          <button
            type="button"
            className="btn-stone ml-1 !px-2.5 !py-2 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <HiXMark className="h-5 w-5" /> : <HiBars3 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-white/10 bg-ink-950/95 backdrop-blur-xl xl:hidden" aria-label="Móvil">
          <div className="container-cubo grid gap-1 py-3">
            {[...ITEMS, { href: '/todo-un-cubo', label: 'Todo un Cubo', Icon: FaCube }].map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={cn('flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold hover:bg-white/5', isActive(href) ? 'text-gold-300' : 'text-bone')}>
                <Icon className="h-5 w-5 opacity-80" /> {label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="btn-stone flex-1">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
