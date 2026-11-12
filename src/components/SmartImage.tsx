import Image, { type ImageProps } from 'next/image';

const OPTIMIZABLE = ['i.ytimg.com', 'img.youtube.com', '.supabase.co'];

/**
 * next/image que optimiza (AVIF/WebP, tamaños responsive) las imágenes de Supabase y YouTube,
 * y deja pasar sin optimizar las URLs externas pegadas en el panel para que nunca fallen.
 */
export default function SmartImage(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  let unoptimized = props.unoptimized;
  if (src.startsWith('http')) {
    try {
      const host = new URL(src).hostname;
      unoptimized = unoptimized ?? !OPTIMIZABLE.some((h) => (h.startsWith('.') ? host.endsWith(h) : host === h));
    } catch {
      unoptimized = true;
    }
  }
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} unoptimized={unoptimized} />;
}
