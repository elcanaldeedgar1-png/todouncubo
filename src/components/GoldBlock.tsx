/**
 * Logotipo de TODO UN CUBO: un bloque de oro isométrico con textura pixelada.
 * Las tres caras usan la misma textura 16×16 proyectada con matrices isométricas
 * y se sombrean de forma distinta para dar volumen e iluminación.
 */
export function GoldTexture() {
  return (
    <>
      <rect width="16" height="16" fill="#fcdb3f" />
      {/* borde del bloque */}
      <path d="M0 0h16v1H0zM0 15h16v1H0zM0 0h1v16H0zM15 0h1v16h-1z" fill="#d99a0b" />
      {/* brillos */}
      <path d="M1 1h6v1H1zM1 2h2v2H1zM9 1h3v1H9zM12 4h2v1h-2zM4 6h3v1H4zM2 9h1v3H2zM9 8h2v1H9zM6 11h3v1H6zM12 10h1v2h-1z" fill="#fff6b8" />
      {/* tonos medios */}
      <path d="M4 3h3v1H4zM8 4h3v1H8zM11 6h3v1h-3zM3 7h1v2H3zM7 8h2v1H7zM10 11h2v1h-2zM4 12h2v1H4zM13 12h1v2h-1z" fill="#f5c11e" />
      {/* sombras */}
      <path d="M13 1h2v2h-2zM14 3h1v11h-1zM1 14h13v1H1zM8 13h4v1H8zM2 13h2v1H2zM5 9h2v1H5zM11 2h1v1h-1z" fill="#e2a90e" />
    </>
  );
}

export default function GoldBlock({ size = 40, glow = false, className }: { size?: number; glow?: boolean; className?: string }) {
  // Los ids son fijos a propósito: todas las instancias definen exactamente la misma textura,
  // así que no importa a cuál apunte <use>. Evita hooks y funciona en Server Components.
  const uid = 'tuc';
  const tex = `gt-${uid}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Bloque de oro — Todo un Cubo"
      shapeRendering="crispEdges"
    >
      <defs>
        <g id={tex}>
          <GoldTexture />
        </g>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {glow && (
          <radialGradient id={`glow-${uid}`}>
            <stop offset="0" stopColor="#ffd83d" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd83d" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      {glow && <ellipse cx="32" cy="34" rx="31" ry="30" fill={`url(#glow-${uid})`} />}
      {/* cara superior (más iluminada) */}
      <g transform="matrix(1.625 -0.9375 1.625 0.9375 6 19)">
        <use href={`#${tex}`} />
        <rect width="16" height="16" fill={`url(#sheen-${uid})`} />
      </g>
      {/* cara izquierda */}
      <g transform="matrix(1.625 0.9375 0 1.75 6 19)">
        <use href={`#${tex}`} />
        <rect width="16" height="16" fill="#8a5200" opacity="0.22" />
      </g>
      {/* cara derecha (más oscura) */}
      <g transform="matrix(1.625 -0.9375 0 1.75 32 34)">
        <use href={`#${tex}`} />
        <rect width="16" height="16" fill="#5a3200" opacity="0.42" />
      </g>
      {/* aristas */}
      <path d="M32 4 58 19 32 34 6 19Z M6 19v28l26 15 26-15V19 M32 34v28" fill="none" stroke="#7a4a00" strokeOpacity="0.55" strokeWidth="0.8" shapeRendering="geometricPrecision" strokeLinejoin="round" />
      <path d="M6.6 19.2 32 4.6" stroke="#fffbe0" strokeOpacity="0.8" strokeWidth="0.9" shapeRendering="geometricPrecision" />
    </svg>
  );
}
