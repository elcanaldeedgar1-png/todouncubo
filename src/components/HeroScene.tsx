/**
 * Escena nocturna pixelada para el banner (SVG puro, sin imágenes externas: pesa poco y escala a cualquier tamaño).
 * Capas: cielo → estrellas → luna → colinas → bosque lejano → portal en ruinas con faroles → árboles cercanos → suelo.
 */

const W = 1600;
const H = 440;
const P = 8; // tamaño de "píxel"

// Generador pseudoaleatorio determinista (misma escena en servidor y cliente)
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const r = rng(42);
const STARS = Array.from({ length: 70 }, () => ({ x: Math.floor(r() * W / 4) * 4, y: Math.floor(r() * 220 / 4) * 4, s: r() > 0.85 ? 4 : 2, o: 0.35 + r() * 0.6 }));

// Silueta escalonada (colinas) a partir de alturas por columna
function steps(seed: number, base: number, amp: number, col: number) {
  const g = rng(seed);
  let h = base;
  let d = `M0 ${H}`;
  for (let x = 0; x <= W; x += col) {
    h = Math.max(base - amp, Math.min(base + amp, h + Math.round((g() - 0.5) * 4) * P));
    d += ` L${x} ${h} L${x + col} ${h}`;
  }
  return `${d} L${W} ${H} Z`;
}

// Árbol de bloques: tronco + copa en capas
function Tree({ x, y, s = 1, leaf, leafDark, trunk = '#3a2716' }: { x: number; y: number; s?: number; leaf: string; leafDark: string; trunk?: string }) {
  const u = P * s;
  return (
    <g>
      <rect x={x + 2 * u} y={y + 4 * u} width={u} height={5 * u} fill={trunk} />
      <rect x={x} y={y + 2 * u} width={5 * u} height={3 * u} fill={leafDark} />
      <rect x={x + u * 0.5} y={y + u} width={4 * u} height={2 * u} fill={leaf} />
      <rect x={x + 1.5 * u} y={y} width={2 * u} height={u} fill={leaf} />
      <rect x={x + u} y={y + 1.5 * u} width={u} height={u} fill={leafDark} opacity={0.6} />
      <rect x={x + 3 * u} y={y + 3 * u} width={u} height={u} fill={leaf} opacity={0.5} />
    </g>
  );
}

function Lantern({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x + 6} cy={y + 8} r={34} fill="url(#lanternGlow)" />
      <rect x={x + 3} y={y - 4} width={6} height={4} fill="#2b2b2b" />
      <rect x={x} y={y} width={12} height={16} fill="#3a2a1a" />
      <rect x={x + 2} y={y + 3} width={8} height={10} fill="#ffb347">
        <animate attributeName="fill" values="#ffb347;#ffd27a;#ffa63a;#ffb347" dur="2.4s" repeatCount="indefinite" />
      </rect>
    </g>
  );
}

const OB = '#16101f';
const OB2 = '#2a1f3d';

export default function HeroScene({ className }: { className?: string }) {
  const portalX = 1260;
  const portalY = 150;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden shapeRendering="crispEdges">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070b1c" />
          <stop offset="0.45" stopColor="#13214a" />
          <stop offset="0.8" stopColor="#24386a" />
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor="#cfe0ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#cfe0ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="portalGlow">
          <stop offset="0" stopColor="#b25cff" stopOpacity="0.65" />
          <stop offset="1" stopColor="#7a2cff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lanternGlow">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff9a2a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="portalFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a17b8" />
          <stop offset="0.5" stopColor="#9a3dff" />
          <stop offset="1" stopColor="#4a0f9e" />
        </linearGradient>
        <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#08080a" stopOpacity="0" />
          <stop offset="1" stopColor="#08080a" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="centerShade" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#05060d" stopOpacity="0.55" />
          <stop offset="1" stopColor="#05060d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* cielo y estrellas */}
      <rect width={W} height={H} fill="url(#sky)" />
      {STARS.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.s} height={s.s} fill="#e8eeff" opacity={s.o} />
      ))}

      {/* luna pixelada */}
      <circle cx={250} cy={78} r={110} fill="url(#moonGlow)" />
      <g transform="translate(214 42) rotate(-8 36 36)">
        <rect width={72} height={72} fill="#dfe8ff" />
        <rect x={8} y={8} width={16} height={16} fill="#b9c8ec" />
        <rect x={40} y={16} width={24} height={16} fill="#c8d5f3" />
        <rect x={16} y={40} width={24} height={24} fill="#b9c8ec" />
        <rect x={48} y={48} width={16} height={8} fill="#c8d5f3" />
        <rect width={72} height={4} fill="#f4f7ff" />
      </g>

      {/* colinas y bosque lejano */}
      <path d={steps(7, 270, 32, 48)} fill="#101c33" />
      <path d={steps(11, 300, 24, 32)} fill="#0f2427" />
      {Array.from({ length: 22 }, (_, i) => (
        <Tree key={`f${i}`} x={i * 76 - 20 + (i % 3) * 8} y={238 + (i % 4) * 10} s={0.9} leaf="#1c3b2a" leafDark="#142c20" trunk="#1d1a14" />
      ))}

      {/* portal en ruinas */}
      <circle cx={portalX + 72} cy={portalY + 96} r={170} fill="url(#portalGlow)">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
      </circle>
      <g>
        {/* escalera de piedra */}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={`st${i}`} x={portalX - 120 + i * 24} y={330 - i * 16} width={260 - i * 24} height={16 + i * 16} fill={i % 2 ? '#4c4f57' : '#5c6069'} />
        ))}
        <rect x={portalX - 120} y={330} width={420} height={4} fill="#767a84" />
        {/* marco de obsidiana (incompleto, "en ruinas") */}
        <rect x={portalX} y={portalY} width={24} height={192} fill={OB} />
        <rect x={portalX + 120} y={portalY + 24} width={24} height={168} fill={OB} />
        <rect x={portalX} y={portalY} width={104} height={24} fill={OB} />
        <rect x={portalX} y={portalY + 168} width={144} height={24} fill={OB} />
        <rect x={portalX + 4} y={portalY + 4} width={8} height={8} fill={OB2} />
        <rect x={portalX + 124} y={portalY + 60} width={8} height={8} fill={OB2} />
        <rect x={portalX + 40} y={portalY + 172} width={8} height={8} fill={OB2} />
        {/* bloques de piedra musgosa alrededor */}
        <rect x={portalX - 24} y={portalY + 96} width={24} height={24} fill="#55604c" />
        <rect x={portalX + 144} y={portalY + 120} width={24} height={24} fill="#4b5547" />
        <rect x={portalX + 104} y={portalY} width={24} height={24} fill="#5a5e66" />
        {/* interior del portal */}
        <rect x={portalX + 24} y={portalY + 24} width={96} height={144} fill="url(#portalFill)" />
        {[[30, 40], [70, 30], [50, 80], [90, 110], [34, 130], [80, 70], [60, 140]].map(([dx, dy], i) => (
          <rect key={`pp${i}`} x={portalX + dx} y={portalY + dy} width={8} height={8} fill="#d29bff">
            <animate attributeName="opacity" values="0;0.9;0" dur={`${1.6 + (i % 3) * 0.7}s`} begin={`${i * 0.35}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </g>
      <Lantern x={portalX - 70} y={300} />
      <Lantern x={portalX + 200} y={282} />
      <Lantern x={portalX + 300} y={318} />

      {/* árboles cercanos */}
      <Tree x={-10} y={150} s={3.2} leaf="#26502f" leafDark="#1b3a24" />
      <Tree x={150} y={210} s={2.2} leaf="#2b5a33" leafDark="#1d4026" />
      <Tree x={420} y={250} s={1.6} leaf="#2b5a33" leafDark="#1d4026" />
      <Tree x={1500} y={150} s={3} leaf="#26502f" leafDark="#1b3a24" />

      {/* suelo de hierba */}
      <path d={steps(23, 362, 8, 64)} fill="#3d7a2b" />
      <rect y={384} width={W} height={56} fill="#2a5420" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={`g${i}`} x={i * 40 + (i % 5) * 4} y={372 + (i % 3) * 6} width={8} height={8} fill={i % 7 === 0 ? '#e8d34a' : i % 5 === 0 ? '#d94a4a' : '#56a03b'} opacity={0.8} />
      ))}

      {/* sombreado para que el texto se lea y fundido con la página */}
      <rect width={W} height={H} fill="url(#centerShade)" />
      <rect width={W} height={H} fill="url(#fadeBottom)" />
    </svg>
  );
}
