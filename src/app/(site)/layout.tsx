import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DemoBanner from '@/components/DemoBanner';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, site } from '@/lib/site';

// Todas las páginas públicas se generan en cada visita con los datos más recientes de Supabase:
// una semilla, artículo o video nuevo aparece al instante, sin cachés que invalidar.
export const dynamic = 'force-dynamic';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-ink-950">
        Saltar al contenido
      </a>
      <DemoBanner />
      <Header />
      <main id="contenido">{children}</main>
      <Footer />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.name,
          url: SITE_URL,
          inLanguage: 'es',
          publisher: { '@type': 'Person', name: site.creator, sameAs: [site.social.tiktok, site.social.instagram, site.social.youtube] },
          potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/semillas?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
        }}
      />
    </>
  );
}
