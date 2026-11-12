import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Las páginas se generan en cada visita (ver src/app/(site)/layout.tsx), así que no hace falta
// configurar almacenamiento de caché (R2/KV): el contenido nuevo aparece al instante.
export default defineCloudflareConfig({});
