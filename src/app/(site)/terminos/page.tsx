import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Markdown from '@/components/Markdown';

export const metadata: Metadata = { title: 'Términos de uso', alternates: { canonical: '/terminos' } };

// Texto base: revísalo y adáptalo a tu caso (no es asesoramiento legal).
const TEXT = `
## Uso de la web
TodoUnCubo es una web de contenido sobre Minecraft creada por TrexxCraft. Puedes usar libremente las semillas y coordenadas publicadas en tus propios mundos.

## Contenido de terceros
Los mods, add-ons, shaders y packs de texturas pertenecen a sus autores. Enlazamos siempre a sus páginas oficiales de descarga; respeta sus licencias.

## Sin garantías
Las semillas y coordenadas se comprueban en la versión indicada, pero pueden cambiar entre versiones o ediciones del juego. Haz copia de seguridad de tus mundos antes de instalar mods.

## Marcas
Minecraft es una marca de Mojang Studios / Microsoft. TodoUnCubo no es un producto oficial ni está asociado con Mojang o Microsoft.
`;

export default function TermsPage() {
  return (
    <>
      <PageHero title="Términos de uso" crumbs={[{ href: '/terminos', label: 'Términos' }]} />
      <div className="container-cubo max-w-3xl py-10"><Markdown>{TEXT}</Markdown></div>
    </>
  );
}
