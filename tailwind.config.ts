import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#08080a', 900: '#0d0d10', 850: '#121215', 800: '#17171b', 700: '#1f1f24', 600: '#2a2a30', 500: '#3a3a42' },
        gold: { 50: '#fff9db', 100: '#fff0a8', 200: '#ffe46b', 300: '#ffd83d', 400: '#f9c623', 500: '#e8ab12', 600: '#c3870b', 700: '#94620a', 800: '#5f3f08' },
        bone: { DEFAULT: '#ece8dc', muted: '#a19d92', dim: '#6d6a63' },
        grass: '#5fae3a',
        diamond: '#4fd8d2',
        redstone: '#e0453a',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        pixel: ['var(--font-pixel)', 'monospace'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      boxShadow: {
        block: 'inset 0 2px 0 rgba(255,255,255,0.06), inset 0 -4px 0 rgba(0,0,0,0.45), 0 8px 24px -12px rgba(0,0,0,0.8)',
        gold: '0 0 0 1px rgba(249,198,35,0.35), 0 10px 40px -10px rgba(249,198,35,0.45)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shine: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        rise: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shine: 'shine 6s linear infinite',
        rise: 'rise .6s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
