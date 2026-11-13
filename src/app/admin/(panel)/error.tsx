'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { isStaleBuildError, reloadOnceForStaleBuild } from '@/lib/stale-build';

/**
 * Pantalla de error del panel: en vez de la pantalla negra de Next muestra el motivo,
 * recuerda que lo guardado probablemente ya está guardado y ofrece reintentar.
 */
export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    // Si la página abierta es de una versión anterior de la web, recargar lo arregla.
    if (isStaleBuildError(error)) reloadOnceForStaleBuild();
  }, [error]);

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="pixel-title text-3xl text-bone">Algo ha fallado</h1>
      <div className="block-panel space-y-3 p-6 text-sm text-bone-muted">
        <p>
          La página no se ha podido mostrar. Si estabas guardando algo, <strong className="text-bone">lo más probable es que sí se
          haya guardado</strong>: revísalo en la lista antes de volver a publicarlo para no duplicarlo.
        </p>
        <p className="rounded-lg border border-ink-600 bg-ink-900 p-3 font-mono text-xs text-[#ff8b80] break-words">
          {error.message || 'Error desconocido'}
          {error.digest && <span className="block text-bone-dim">Código: {error.digest}</span>}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => window.location.reload()} className="btn-gold">Recargar la página</button>
        <button type="button" onClick={reset} className="btn-stone">Reintentar</button>
        <Link href="/admin/semillas" className="btn-stone">Ir a Semillas</Link>
      </div>
    </div>
  );
}
