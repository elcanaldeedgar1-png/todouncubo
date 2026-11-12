import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
// Fuentes alojadas en el propio proyecto (no dependen de Google Fonts):
// Tiny5 = títulos pixelados estilo Minecraft · Inter = texto legible
import '@fontsource/tiny5/latin-400.css';
import '@fontsource/tiny5/latin-ext-400.css';
import '@fontsource-variable/inter/wght.css';
import './globals.css';
import { SITE_URL, site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} — Semillas, mods y shaders de Minecraft`, template: `%s · ${site.shortName}` },
  description: site.description,
  applicationName: site.shortName,
  authors: [{ name: site.creator }],
  creator: site.creator,
  keywords: ['Minecraft', 'semillas de Minecraft', 'seeds', 'Bedrock', 'Java', 'mods', 'add-ons', 'shaders', 'texturas', 'TrexxCraft', 'Todo un Cubo'],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: site.locale, siteName: site.shortName, title: site.name, description: site.description, url: SITE_URL },
  twitter: { card: 'summary_large_image', title: site.name, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
};

export const viewport: Viewport = { themeColor: '#08080a', width: 'device-width', initialScale: 1 };

const ADSENSE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        {children}
        {ADSENSE && (
          <Script
            id="adsense"
            strategy="lazyOnload"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}`}
          />
        )}
      </body>
    </html>
  );
}
