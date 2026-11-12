import { FaDiscord } from 'react-icons/fa6';
import GoldBlock from './GoldBlock';
import { site } from '@/lib/site';

export default function DiscordCTA() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#5865f2]/40 bg-gradient-to-br from-[#1b1d3a] via-ink-850 to-ink-900 p-8 shadow-block sm:p-12">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#5865f2]/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-6 right-10 hidden opacity-80 md:block" aria-hidden>
        <GoldBlock size={120} className="animate-float" />
      </div>
      <div className="relative max-w-xl">
        <p className="eyebrow !text-[#9aa3ff]">Comunidad</p>
        <h2 className="pixel-title mt-4 text-3xl text-bone sm:text-4xl">Únete al Discord de Todo un Cubo</h2>
        <p className="mt-4 text-bone-muted">
          Comparte tus mundos, pide semillas, enseña tus construcciones y entérate antes que nadie de los nuevos videos.
        </p>
        <a
          href={site.social.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="btn mt-7 bg-[#5865f2] text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-3px_0_#3a43b8] hover:brightness-110"
        >
          <FaDiscord className="h-5 w-5" /> Unirme al servidor
        </a>
      </div>
    </section>
  );
}
