import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Markdown from '@/components/Markdown';

export const metadata: Metadata = { title: 'Política de privacidad', alternates: { canonical: '/privacidad' } };

// Texto base: revísalo y adáptalo a tu caso (no es asesoramiento legal).
const TEXT = `
Última actualización: ${new Date().getFullYear()}.

## Qué datos recogemos
TodoUnCubo no pide registro a los visitantes. No recogemos tu nombre, correo ni otros datos personales para navegar por la web.

## Cookies y publicidad
Esta web puede mostrar anuncios de **Google AdSense**. Google y sus socios pueden usar cookies para mostrar anuncios según tus visitas a esta y otras webs. Puedes desactivar la publicidad personalizada en [Configuración de anuncios de Google](https://adssettings.google.com).
Más información sobre cómo usa Google los datos: [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

## Contenido incrustado
Los videos se muestran con el reproductor de YouTube en modo de privacidad mejorada (\`youtube-nocookie.com\`), que solo se carga cuando pulsas reproducir.

## Enlaces externos
Enlazamos a YouTube, TikTok, Instagram, Discord y webs de descarga de mods o shaders. Cada una tiene su propia política de privacidad.

## Contacto
Si tienes dudas sobre esta política, escríbenos a través de nuestras redes (ver la página de Contacto).
`;

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Política de privacidad" crumbs={[{ href: '/privacidad', label: 'Privacidad' }]} />
      <div className="container-cubo max-w-3xl py-10"><Markdown>{TEXT}</Markdown></div>
    </>
  );
}
