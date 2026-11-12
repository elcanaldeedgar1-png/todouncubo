import Link from 'next/link';
import { FaDiscord, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
import GoldBlock from './GoldBlock';
import { site } from '@/lib/site';

const LEGAL = [
  { href: '/contacto', label: 'Contacto' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/terminos', label: 'Términos' },
];

const SOCIAL = [
  { href: site.social.youtube, label: 'YouTube', Icon: FaYoutube },
  { href: site.social.discord, label: 'Discord', Icon: FaDiscord },
  { href: site.social.instagram, label: 'Instagram', Icon: FaInstagram },
  { href: site.social.tiktok, label: 'TikTok', Icon: FaTiktok },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-ink-900/90">
      <div className="container-cubo flex flex-col items-center gap-5 py-7 md:flex-row">
        <Link href="/" className="flex items-center gap-3">
          <GoldBlock size={40} className="drop-shadow-[0_0_10px_rgba(249,198,35,0.4)]" />
          <span className="pixel-title text-2xl text-white">TodoUnCubo</span>
        </Link>
        <span className="hidden h-8 w-px bg-white/15 md:block" aria-hidden />
        <p className="text-bone-muted">Minecraft, siempre con TodoUnCubo.</p>

        <nav className="flex items-center text-sm text-bone-muted md:ml-auto" aria-label="Legal">
          {LEGAL.map((l, i) => (
            <span key={l.href} className="flex items-center">
              {i > 0 && <span className="mx-3 h-4 w-px bg-white/20" aria-hidden />}
              <Link href={l.href} className="hover:text-gold-200">{l.label}</Link>
            </span>
          ))}
        </nav>
        <span className="hidden h-8 w-px bg-white/15 md:block" aria-hidden />
        <ul className="flex items-center gap-1">
          {SOCIAL.map(({ href, label, Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} de TodoUnCubo`} className="grid h-10 w-10 place-items-center rounded-lg text-bone/80 transition hover:bg-white/5 hover:text-gold-200">
                <Icon className="h-[22px] w-[22px]" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-white/5">
        <p className="container-cubo py-4 text-center text-xs text-bone-dim md:text-left">
          © {new Date().getFullYear()} TodoUnCubo · Creado por {site.creator}. No es un producto oficial de Minecraft. No está aprobado ni asociado con Mojang o Microsoft.
        </p>
      </div>
    </footer>
  );
}
