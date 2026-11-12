import { isSupabaseConfigured } from '@/lib/supabase/env';

export default function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="border-b border-gold-500/30 bg-gold-400/10 text-center text-xs text-gold-100">
      <p className="container-cubo py-2">
        <strong>Modo demo:</strong> se muestra contenido de ejemplo. Conecta Supabase (ver README) para usar tus semillas, videos y publicaciones reales.
      </p>
    </div>
  );
}
