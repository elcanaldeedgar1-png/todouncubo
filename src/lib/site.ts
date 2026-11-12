export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

const youtubeUrl = process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim();

export const site = {
  name: 'TodoUnCubo',
  shortName: 'TodoUnCubo',
  creator: 'TrexxCraft',
  tagline: 'La biblioteca de Minecraft de TrexxCraft',
  description:
    'Semillas de Minecraft con coordenadas, mods, add-ons, shaders, texturas, tutoriales y novedades para Java y Bedrock. Todo un Cubo, por TrexxCraft.',
  locale: 'es_ES',
  social: {
    // Mientras no configures NEXT_PUBLIC_YOUTUBE_URL, el botón abre una búsqueda del canal en YouTube.
    youtube: youtubeUrl || 'https://www.youtube.com/results?search_query=TrexxCraft',
    youtubeConfigured: Boolean(youtubeUrl),
    tiktok: 'https://www.tiktok.com/@trexxcraft',
    instagram: 'https://www.instagram.com/trexxcraft/',
    discord: 'https://discord.com/invite/qR8fpcevdv',
  },
} as const;

export const NAV = [
  { href: '/semillas', label: 'Semillas' },
  { href: '/videos', label: 'Videos' },
  { href: '/mods-y-addons', label: 'Mods' },
  { href: '/shaders-y-texturas', label: 'Shaders' },
  { href: '/tutoriales', label: 'Tutoriales' },
  { href: '/novedades', label: 'Novedades' },
  { href: '/todo-un-cubo', label: 'Todo un Cubo' },
] as const;

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
