'use client';
import { useEffect, useState } from 'react';

/** Selector de imagen con vista previa. Envía el archivo en `name` y la URL actual en `currentName`. */
export default function ImageField({ name, currentName, current, label }: { name: string; currentName: string; current?: string | null; label: string }) {
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [url, setUrl] = useState(current ?? '');

  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-ink-600 bg-ink-900 sm:w-64">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
          ) : (
            <div className="pixel-landscape h-full w-full opacity-60" />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="file"
            name={name}
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            className="block w-full text-sm text-bone-muted file:mr-4 file:rounded-lg file:border-0 file:bg-ink-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-bone hover:file:bg-ink-500"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
          <input
            name={currentName}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setPreview(e.target.value || null);
            }}
            className="input"
            placeholder="…o pega la URL de una imagen"
          />
          <p className="text-xs text-bone-dim">PNG, JPG, WEBP o AVIF, máx. 8 MB. Se optimiza automáticamente al mostrarse.</p>
        </div>
      </div>
    </div>
  );
}
