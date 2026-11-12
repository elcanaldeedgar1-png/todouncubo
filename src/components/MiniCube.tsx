const PALETTE: Record<string, [string, string, string]> = {
  gold: ['#ffe46b', '#e8ab12', '#a86c06'],
  grass: ['#7cc94e', '#7a5236', '#5a3b26'],
  diamond: ['#9ff3ee', '#3fbdb7', '#23807c'],
  redstone: ['#ff7366', '#c8352b', '#8a1f18'],
  stone: ['#a5a5ab', '#7c7c82', '#55555b'],
};

/** Cubo isométrico sencillo para iconos de categoría. */
export default function MiniCube({ accent = 'gold', size = 40 }: { accent?: string; size?: number }) {
  const [top, left, right] = PALETTE[accent] ?? PALETTE.gold;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path d="M32 6 56 20 32 34 8 20Z" fill={top} />
      <path d="M8 20 32 34v24L8 44Z" fill={left} />
      <path d="M56 20 32 34v24l24-14Z" fill={right} />
      <path d="M32 6 56 20 32 34 8 20Z M8 20v24l24 14 24-14V20 M32 34v24" fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="1" strokeLinejoin="round" />
      <path d="M14 20 32 9.5" stroke="#fff" strokeOpacity=".45" strokeWidth="1.5" />
    </svg>
  );
}
