'use client';
import { useEffect } from 'react';
import { isStaleBuildError, reloadOnceForStaleBuild } from '@/lib/stale-build';

/** Último recurso si falla toda la página (sustituye la pantalla negra de «Application error»). */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
    if (isStaleBuildError(error)) reloadOnceForStaleBuild();
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0b0d', color: '#ece6d6', fontFamily: 'system-ui, sans-serif', padding: 16 }}>
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Algo ha fallado</h1>
          <p style={{ color: '#b9b2a2', lineHeight: 1.5 }}>
            La página no se ha podido mostrar. Recárgala; si estabas guardando algo en el panel, revisa la lista antes de repetirlo.
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#ff8b80', wordBreak: 'break-word' }}>
            {error.message || 'Error desconocido'}
            {error.digest ? ` · ${error.digest}` : ''}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: 12, padding: '10px 20px', borderRadius: 8, border: 0, background: '#f9c623', color: '#1a1205', fontWeight: 700, cursor: 'pointer' }}
          >
            Recargar la página
          </button>
        </div>
      </body>
    </html>
  );
}
