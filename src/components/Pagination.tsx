import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Pagination({
  page,
  total,
  pageSize,
  basePath,
  params = {},
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
    if (p > 1) sp.set('pagina', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const windowed = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 2);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación">
      {page > 1 && <Link href={href(page - 1)} className="btn-stone !px-3 !py-2" rel="prev">← Anterior</Link>}
      {windowed.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && windowed[i - 1] !== p - 1 && <span className="text-bone-dim">…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn('grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-semibold', p === page ? 'border-gold-400 bg-gold-400/15 text-gold-200' : 'border-ink-500 bg-ink-800 text-bone-muted hover:text-bone')}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pages && <Link href={href(page + 1)} className="btn-stone !px-3 !py-2" rel="next">Siguiente →</Link>}
    </nav>
  );
}
