import Link from 'next/link';
import GoldBlock from '@/components/GoldBlock';

export default function NotFound() {
  return (
    <div className="container-cubo flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <GoldBlock size={96} className="animate-float" />
      <p className="pixel-title mt-8 text-5xl text-gold-gradient">404</p>
      <h1 className="mt-3 text-xl font-semibold text-bone">Este chunk no se ha generado</h1>
      <p className="mt-2 text-bone-muted">La página que buscas no existe o fue movida.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-gold">Volver al inicio</Link>
        <Link href="/semillas" className="btn-stone">Buscar semillas</Link>
      </div>
    </div>
  );
}
