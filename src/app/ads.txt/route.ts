// ads.txt para Google AdSense, generado a partir de NEXT_PUBLIC_ADSENSE_CLIENT
export const dynamic = 'force-static';

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.replace(/^ca-/, '');
  const body = client ? `google.com, ${client}, DIRECT, f08c47fec0942fa0\n` : '# AdSense aún no configurado\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
