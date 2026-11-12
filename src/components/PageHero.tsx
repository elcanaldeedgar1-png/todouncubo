import Link from 'next/link';
import MiniCube from './MiniCube';
import GoldBlock from './GoldBlock';

export default function PageHero({
  eyebrow,
  title,
  description,
  accent,
  crumbs = [],
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  accent?: string;
  crumbs?: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-ink-700">
      <div className="pointer-events-none absolute left-1/2 top-[-60%] h-[360px] w-[700px] -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl" aria-hidden />
      <div className="container-cubo relative py-12 sm:py-16">
        {crumbs.length > 0 && (
          <nav aria-label="Migas de pan" className="mb-5 text-xs text-bone-dim">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-gold-200">Inicio</Link></li>
              {crumbs.map((c) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  <span aria-hidden>/</span>
                  <Link href={c.href} className="hover:text-gold-200">{c.label}</Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex items-start gap-5">
          <div className="hidden shrink-0 sm:block">{accent ? <MiniCube accent={accent} size={64} /> : <GoldBlock size={64} />}</div>
          <div className="min-w-0 animate-rise">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="pixel-title mt-2 text-3xl text-bone sm:text-5xl">{title}</h1>
            {description && <p className="mt-3 max-w-2xl text-bone-muted">{description}</p>}
          </div>
        </div>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
