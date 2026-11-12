import { requireAdmin } from '@/lib/supabase/server';
import { Alert, SubmitButton } from '@/components/admin/ui';
import { saveSettings, subscribePush } from '../../actions';
import { formatDate } from '@/lib/utils';

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase: sb } = await requireAdmin();
  const { data } = await sb.from('settings').select('key,value');
  const s = Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, unknown>;

  const env = [
    ['YOUTUBE_CHANNEL_ID', Boolean(process.env.YOUTUBE_CHANNEL_ID)],
    ['YOUTUBE_API_KEY (opcional)', Boolean(process.env.YOUTUBE_API_KEY)],
    ['SUPABASE_SERVICE_ROLE_KEY', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)],
    ['CRON_SECRET', Boolean(process.env.CRON_SECRET)],
    ['WEBSUB_SECRET', Boolean(process.env.WEBSUB_SECRET)],
    ['NEXT_PUBLIC_YOUTUBE_URL', Boolean(process.env.NEXT_PUBLIC_YOUTUBE_URL)],
    ['NEXT_PUBLIC_ADSENSE_CLIENT (opcional)', Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT)],
  ] as const;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="pixel-title text-3xl text-bone">Ajustes y copias</h1>
      {sp.ok && <Alert>{sp.ok === 'suscrito' ? 'Suscripción a notificaciones de YouTube solicitada.' : 'Ajustes guardados.'}</Alert>}
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <section className="block-panel p-6">
        <h2 className="font-semibold text-bone">Sincronización con YouTube</h2>
        <p className="mt-1 text-sm text-bone-muted">
          Última sincronización: <strong className="text-bone">{typeof s.last_sync_at === 'string' ? `${formatDate(s.last_sync_at)} ${new Date(s.last_sync_at).toLocaleTimeString('es-ES')}` : 'nunca'}</strong>
        </p>
        <form action={saveSettings} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="sync_interval_minutes">Frecuencia de consulta (minutos)</label>
            <input id="sync_interval_minutes" name="sync_interval_minutes" type="number" min={5} max={1440} defaultValue={Number(s.sync_interval_minutes ?? 30)} className="input max-w-[160px]" />
            <p className="mt-1 text-xs text-bone-dim">Respaldo de las notificaciones instantáneas. Mínimo 5, máximo 1440 (un día).</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-bone">
            <input type="checkbox" name="auto_publish_videos" defaultChecked={s.auto_publish_videos !== false} className="h-4 w-4 accent-[#f9c623]" />
            Publicar automáticamente los videos nuevos (si lo desmarcas quedarán “pendientes” hasta que los revises)
          </label>
          <SubmitButton>Guardar ajustes</SubmitButton>
        </form>
        <form action={subscribePush} className="mt-6 border-t border-ink-700 pt-5">
          <p className="mb-3 text-sm text-bone-muted">Notificaciones instantáneas (WebSub): YouTube avisa a la web en cuanto subes un video. Se renuevan solas cada día.</p>
          <SubmitButton className="btn-stone" pendingText="Solicitando…">Activar / renovar notificaciones</SubmitButton>
        </form>
      </section>

      <section className="block-panel p-6">
        <h2 className="font-semibold text-bone">Copia de seguridad</h2>
        <p className="mt-1 text-sm text-bone-muted">Descarga todo el contenido (semillas, coordenadas, publicaciones, videos, categorías) en un archivo JSON.</p>
        <a href="/api/admin/backup" className="btn-gold mt-4">⬇ Descargar copia de seguridad</a>
      </section>

      <section className="block-panel p-6">
        <h2 className="font-semibold text-bone">Estado de la configuración</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {env.map(([k, ok]) => (
            <li key={k} className="flex items-center gap-2">
              <span className={ok ? 'text-[#9be27a]' : 'text-[#ff8b80]'}>{ok ? '✔' : '✕'}</span>
              <code className="text-bone-muted">{k}</code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
