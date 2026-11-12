// Contenido de EJEMPLO que solo se muestra cuando Supabase todavía no está configurado.
// No representa semillas reales: en producción todo sale de la base de datos.
import type { Category, Post, Seed, Video } from './types';

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();
const base = { created_at: daysAgo(30), updated_at: daysAgo(1) };

export const demoCategories: Category[] = [
  { id: 'c1', slug: 'mods-y-addons', name: 'Mods y Add-ons', description: 'Mods, complementos y add-ons para Java y Bedrock.', accent: 'grass', sort_order: 1, video_keywords: [], ...base },
  { id: 'c2', slug: 'shaders-y-texturas', name: 'Shaders y texturas', description: 'Shaders, packs de texturas y recursos visuales.', accent: 'diamond', sort_order: 2, video_keywords: [], ...base },
  { id: 'c3', slug: 'tutoriales', name: 'Tutoriales', description: 'Guías, instalaciones, configuraciones y consejos.', accent: 'stone', sort_order: 3, video_keywords: [], ...base },
  { id: 'c4', slug: 'novedades', name: 'Novedades', description: 'Noticias y actualizaciones de Minecraft.', accent: 'redstone', sort_order: 4, video_keywords: [], ...base },
  { id: 'c5', slug: 'todo-un-cubo', name: 'Todo un Cubo', description: 'Curiosidades, secretos, construcciones, experimentos y trucos.', accent: 'gold', sort_order: 5, video_keywords: [], ...base },
];

const cat = (id: string) => {
  const c = demoCategories.find((x) => x.id === id)!;
  return { slug: c.slug, name: c.name, accent: c.accent };
};

export const demoVideos: Video[] = [
  { id: 'v1', youtube_id: 'demo1', title: '[Ejemplo] Semilla con aldea y herrería en el spawn', description: 'Video de ejemplo. Conecta tu canal para ver tus videos reales.', thumbnail_url: null, url: '#', published_at: daysAgo(2), category_id: 'c5', status: 'published', is_featured: true, source: 'manual', reviewed: true, ...base, category: cat('c5') },
  { id: 'v2', youtube_id: 'demo2', title: '[Ejemplo] Los mejores shaders para Bedrock', description: null, thumbnail_url: null, url: '#', published_at: daysAgo(5), category_id: 'c2', status: 'published', is_featured: false, source: 'manual', reviewed: true, ...base, category: cat('c2') },
  { id: 'v3', youtube_id: 'demo3', title: '[Ejemplo] Cómo instalar add-ons paso a paso', description: null, thumbnail_url: null, url: '#', published_at: daysAgo(9), category_id: 'c3', status: 'published', is_featured: false, source: 'manual', reviewed: true, ...base, category: cat('c3') },
  { id: 'v4', youtube_id: 'demo4', title: '[Ejemplo] 10 secretos que no conocías de Minecraft', description: null, thumbnail_url: null, url: '#', published_at: daysAgo(14), category_id: 'c5', status: 'published', is_featured: false, source: 'manual', reviewed: true, ...base, category: cat('c5') },
];

export const demoSeeds: Seed[] = [
  {
    id: 's1', slug: 'ejemplo-aldea-en-el-spawn', name: '[Ejemplo] Aldea en el spawn', seed_code: '0000000000000000001',
    image_url: null, description: 'Ficha de ejemplo para mostrar el diseño. Añade tus semillas reales desde el panel de administración.',
    mc_version: '1.21', editions: ['java', 'bedrock'], video_id: 'v1', status: 'published', is_featured: true, published_at: daysAgo(2),
    structure_types: ['village', 'blacksmith', 'ruined_portal'], seo_title: null, seo_description: null, ...base,
    structures: [
      { type: 'village', name: 'Aldea de llanura', x: 120, y: 70, z: -64, dimension: 'overworld', notes: null, sort_order: 0 },
      { type: 'blacksmith', name: 'Herrería con cofre', x: 132, y: 70, z: -50, dimension: 'overworld', notes: null, sort_order: 1 },
      { type: 'ruined_portal', name: null, x: -210, y: 66, z: 330, dimension: 'overworld', notes: null, sort_order: 2 },
    ],
    video: { id: 'v1', youtube_id: 'demo1', title: '[Ejemplo] Semilla con aldea y herrería en el spawn', url: '#', thumbnail_url: null, published_at: daysAgo(2) },
  },
  {
    id: 's2', slug: 'ejemplo-mansion-y-ciudad-antigua', name: '[Ejemplo] Mansión y ciudad antigua', seed_code: '-0000000000000000002',
    image_url: null, description: 'Ficha de ejemplo con varias estructuras importantes.', mc_version: '1.21', editions: ['java'], video_id: null,
    status: 'published', is_featured: true, published_at: daysAgo(6), structure_types: ['mansion', 'ancient_city'], seo_title: null, seo_description: null, ...base,
    structures: [
      { type: 'mansion', name: null, x: 1840, y: 72, z: 960, dimension: 'overworld', notes: null, sort_order: 0 },
      { type: 'ancient_city', name: null, x: -480, y: -51, z: 1200, dimension: 'overworld', notes: null, sort_order: 1 },
    ],
    video: null,
  },
  {
    id: 's3', slug: 'ejemplo-camara-de-pruebas', name: '[Ejemplo] Cámara de pruebas cerca', seed_code: '0000000000000000003',
    image_url: null, description: 'Ficha de ejemplo para Bedrock.', mc_version: '1.21', editions: ['bedrock'], video_id: null,
    status: 'published', is_featured: false, published_at: daysAgo(10), structure_types: ['trial_chamber', 'pillager_outpost'], seo_title: null, seo_description: null, ...base,
    structures: [
      { type: 'trial_chamber', name: null, x: 300, y: -20, z: 410, dimension: 'overworld', notes: null, sort_order: 0 },
      { type: 'pillager_outpost', name: null, x: -620, y: 80, z: -150, dimension: 'overworld', notes: null, sort_order: 1 },
    ],
    video: null,
  },
];

const post = (id: string, category_id: string, title: string, excerpt: string, d: number, featured = false): Post => ({
  id, slug: `ejemplo-${id}`, category_id, title: `[Ejemplo] ${title}`, excerpt,
  content: `Esta es una **publicación de ejemplo**.\n\nCuando conectes Supabase, aquí aparecerá el contenido que escribas desde el panel de administración.\n\n## Lo que puedes incluir\n\n- Imágenes y galerías\n- Enlaces de descarga\n- Videos relacionados\n`,
  cover_url: null, gallery: [], links: [], video_id: null, status: 'published', is_featured: featured, published_at: daysAgo(d),
  seo_title: null, seo_description: null, ...base, category: cat(category_id),
});

export const demoPosts: Post[] = [
  post('p1', 'c1', 'Add-on de muebles para Bedrock', 'Decora tu casa con cientos de muebles nuevos.', 1, true),
  post('p2', 'c2', 'Shaders ligeros para PC de pocos recursos', 'Gráficos bonitos sin perder FPS.', 3),
  post('p3', 'c3', 'Cómo instalar Fabric y Sodium', 'Guía paso a paso para mejorar el rendimiento.', 4),
  post('p4', 'c4', 'Lo nuevo de la última snapshot', 'Repasamos los cambios más importantes.', 6),
  post('p5', 'c5', '5 decoraciones fáciles para tu base', 'Ideas rápidas con bloques de supervivencia.', 8, true),
];
