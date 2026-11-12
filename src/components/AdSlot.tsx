'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const SLOTS = {
  inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
};

/**
 * Espacio publicitario de AdSense. No renderiza nada hasta que configures
 * NEXT_PUBLIC_ADSENSE_CLIENT y el slot correspondiente, así que nunca deja huecos vacíos.
 * La altura mínima reservada evita saltos de diseño (CLS).
 */
export default function AdSlot({ variant = 'inline', className }: { variant?: keyof typeof SLOTS; className?: string }) {
  const ref = useRef<HTMLModElement>(null);
  const slot = SLOTS[variant];

  useEffect(() => {
    if (!CLIENT || !slot || !ref.current || ref.current.dataset.loaded) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      ref.current.dataset.loaded = '1';
    } catch {
      /* bloqueadores de anuncios: ignorar */
    }
  }, [slot]);

  if (!CLIENT || !slot) return null;

  return (
    <aside className={className} aria-label="Publicidad">
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-bone-dim">Publicidad</p>
      <ins
        ref={ref}
        className="adsbygoogle block overflow-hidden rounded-lg"
        style={{ display: 'block', minHeight: variant === 'sidebar' ? 250 : 100 }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
