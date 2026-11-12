// Catálogo de estructuras de Minecraft (la clave coincide con la columna seed_structures.type)
export const STRUCTURES: Record<string, { label: string; color: string }> = {
  village: { label: 'Aldea', color: '#c9a36b' },
  blacksmith: { label: 'Herrería', color: '#9aa0a6' },
  mansion: { label: 'Mansión del bosque', color: '#8b5a2b' },
  desert_temple: { label: 'Templo del desierto', color: '#e3c27a' },
  jungle_temple: { label: 'Templo de la jungla', color: '#5f8f3a' },
  ocean_monument: { label: 'Monumento oceánico', color: '#4fb3a8' },
  ancient_city: { label: 'Ciudad antigua', color: '#1f6f78' },
  trial_chamber: { label: 'Cámara de pruebas', color: '#c47a3a' },
  pillager_outpost: { label: 'Puesto de saqueadores', color: '#6b6b6b' },
  shipwreck: { label: 'Naufragio', color: '#7a5a3a' },
  ruined_portal: { label: 'Portal en ruinas', color: '#7b3fbf' },
  stronghold: { label: 'Fortaleza', color: '#7d7d7d' },
  nether_fortress: { label: 'Fortaleza del Nether', color: '#6e2b2b' },
  bastion: { label: 'Bastión', color: '#3b3036' },
  end_city: { label: 'Ciudad del End', color: '#c7a5d8' },
  igloo: { label: 'Iglú', color: '#d9eef5' },
  mineshaft: { label: 'Mina abandonada', color: '#8a6a3f' },
  trail_ruins: { label: 'Ruinas de senderos', color: '#a8774f' },
  other: { label: 'Otra estructura', color: '#a19d92' },
};

export const structureLabel = (t: string) => STRUCTURES[t]?.label ?? t;

// Filtros públicos de la biblioteca → grupos de tipos de estructura
export const STRUCTURE_FILTERS: { key: string; label: string; types: string[] }[] = [
  { key: 'aldeas', label: 'Aldeas', types: ['village'] },
  { key: 'herrerias', label: 'Herrerías', types: ['blacksmith'] },
  { key: 'mansiones', label: 'Mansiones', types: ['mansion'] },
  { key: 'templos', label: 'Templos', types: ['desert_temple', 'jungle_temple'] },
  { key: 'ciudades-antiguas', label: 'Ciudades antiguas', types: ['ancient_city'] },
  { key: 'camaras-de-pruebas', label: 'Cámaras de pruebas', types: ['trial_chamber'] },
  { key: 'puestos-saqueadores', label: 'Puestos de saqueadores', types: ['pillager_outpost'] },
  {
    key: 'otras',
    label: 'Otras estructuras',
    types: ['ocean_monument', 'shipwreck', 'ruined_portal', 'stronghold', 'nether_fortress', 'bastion', 'end_city', 'igloo', 'mineshaft', 'trail_ruins', 'other'],
  },
];

export const EDITION_LABEL = { java: 'Java', bedrock: 'Bedrock' } as const;
export const DIMENSION_LABEL = { overworld: 'Overworld', nether: 'Nether', end: 'End' } as const;
