export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'sin-titulo';
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

/** "hace 2 días", "hace 3 semanas"… */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return 'ahora mismo';
}

export function truncate(text: string | null | undefined, max = 160): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/** Limpia el texto de búsqueda para usarlo en filtros PostgREST. */
export function sanitizeSearch(q: string | undefined | null): string {
  return (q ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[%,()*\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const ACCENT_CLASSES: Record<string, { text: string; bg: string; border: string }> = {
  gold: { text: 'text-gold-300', bg: 'bg-gold-400/10', border: 'border-gold-400/40' },
  grass: { text: 'text-[#8fd65f]', bg: 'bg-[#5fae3a]/10', border: 'border-[#5fae3a]/40' },
  diamond: { text: 'text-diamond', bg: 'bg-diamond/10', border: 'border-diamond/40' },
  redstone: { text: 'text-[#ff7a6e]', bg: 'bg-redstone/10', border: 'border-redstone/40' },
  stone: { text: 'text-bone', bg: 'bg-white/5', border: 'border-white/20' },
};
