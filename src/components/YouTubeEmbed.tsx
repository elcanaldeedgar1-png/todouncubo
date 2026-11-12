'use client';
import Image from 'next/image';
import { useState } from 'react';
import { FaPlay } from 'react-icons/fa6';
import { youtubeThumb } from '@/lib/utils';

/** Reproductor ligero: solo carga el iframe de YouTube al pulsar (mejora la velocidad de carga). */
export default function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  const isDemo = id.startsWith('demo');

  if (play && !isDemo) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-ink-600 bg-black">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-ink-600 bg-ink-800"
      aria-label={`Reproducir: ${title}`}
      disabled={isDemo}
    >
      {isDemo ? (
        <div className="pixel-landscape absolute inset-0" />
      ) : (
        <Image src={youtubeThumb(id)} alt={title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
      )}
      <span className="absolute inset-0 grid place-items-center bg-ink-950/30 transition group-hover:bg-ink-950/10">
        <span className="grid h-16 w-16 place-items-center rounded-xl bg-[#ff2d2d] text-white shadow-2xl transition group-hover:scale-110">
          <FaPlay className="ml-1 h-6 w-6" />
        </span>
      </span>
    </button>
  );
}
