import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import { SocialCards } from '@/components/SocialLinks';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con TodoUnCubo y TrexxCraft a través de Discord, YouTube, TikTok o Instagram.',
  alternates: { canonical: '/contacto' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contacto"
        description="¿Tienes una semilla increíble, una idea para un video o una duda? La forma más rápida de hablar conmigo es el servidor de Discord."
        crumbs={[{ href: '/contacto', label: 'Contacto' }]}
      />
      <div className="container-cubo py-10"><SocialCards /></div>
    </>
  );
}
