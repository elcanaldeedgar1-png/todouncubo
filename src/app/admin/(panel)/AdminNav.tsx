'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/semillas', label: 'Semillas' },
  { href: '/admin/publicaciones', label: 'Publicaciones' },
  { href: '/admin/videos', label: 'Videos de YouTube' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/ajustes', label: 'Ajustes y copias' },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
      {ITEMS.map((i) => {
        const active = i.href === '/admin' ? path === '/admin' : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
              active ? 'bg-gold-400/15 text-gold-200' : 'text-bone-muted hover:bg-white/5 hover:text-bone',
            )}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
