import type { Metadata } from 'next';
import Image from '@/components/SmartImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HiArrowTopRightOnSquare } from 'react-icons/hi2';
import Markdown from '@/components/Markdown';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import JsonLd from '@/components/JsonLd';
import AdSlot from '@/components/AdSlot';
import { PostCard } from '@/components/Cards';
import { getPost, getPosts } from '@/lib/data';
import { absoluteUrl, site } from '@/lib/site';
import { formatDate, truncate } from '@/lib/utils';

type Params = Promise<{ categoria: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categoria, slug } = await params;
  const post = await getPost(categoria, slug);
  if (!post) return { title: 'No encontrado', robots: { index: false } };
  const title = post.seo_title || post.title;
  const description = post.seo_description || truncate(post.excerpt || post.content, 158);
  const url = `/${categoria}/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'article', title, description, url: absoluteUrl(url), images: post.cover_url ? [{ url: post.cover_url }] : undefined, publishedTime: post.published_at, modifiedTime: post.updated_at },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { categoria, slug } = await params;
  const post = await getPost(categoria, slug);
  if (!post) notFound();
  const related = await getPosts({ categorySlug: categoria, limit: 3, excludeId: post.id });
  const url = absoluteUrl(`/${categoria}/${post.slug}`);

  return (
    <article className="container-cubo py-10">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Migas de pan" className="mb-6 text-xs text-bone-dim">
          <Link href="/" className="hover:text-gold-200">Inicio</Link> / <Link href={`/${categoria}`} className="hover:text-gold-200">{post.category?.name}</Link>
        </nav>
        <header className="animate-rise">
          <h1 className="pixel-title text-3xl text-bone sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-bone-muted">{post.excerpt}</p>}
          <p className="mt-4 text-xs text-bone-dim">
            Por {site.creator} · <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            {post.updated_at && post.updated_at.slice(0, 10) !== post.published_at.slice(0, 10) && <> · Actualizado el {formatDate(post.updated_at)}</>}
          </p>
        </header>

        {post.cover_url && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-ink-600 shadow-block">
            <Image src={post.cover_url} alt={post.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        <div className="mt-8"><Markdown>{post.content}</Markdown></div>

        {post.links.length > 0 && (
          <section className="block-panel mt-10 p-6">
            <h2 className="label">Enlaces</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {post.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="btn-gold">
                  {l.label} <HiArrowTopRightOnSquare className="h-4 w-4" />
                </a>
              ))}
            </div>
          </section>
        )}

        {post.gallery.length > 0 && (
          <section className="mt-10">
            <h2 className="pixel-title mb-4 text-xl sm:text-2xl text-gold-200">Galería</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {post.gallery.map((src) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="relative aspect-video overflow-hidden rounded-lg border border-ink-600">
                  <Image src={src} alt="" fill sizes="(max-width: 640px) 50vw, 250px" className="object-cover transition hover:scale-105" />
                </a>
              ))}
            </div>
          </section>
        )}

        {post.video && (
          <section className="mt-10">
            <h2 className="pixel-title mb-4 text-xl sm:text-2xl text-gold-200">Video relacionado</h2>
            <YouTubeEmbed id={post.video.youtube_id} title={post.video.title} />
          </section>
        )}
        <AdSlot className="mt-10" />
      </div>

      {related.items.length > 0 && (
        <section className="mt-16">
          <h2 className="pixel-title mb-6 text-2xl sm:text-3xl text-bone">Te puede interesar</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.items.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': categoria === 'novedades' ? 'NewsArticle' : 'Article',
          headline: post.title,
          description: truncate(post.excerpt || post.content, 300),
          image: post.cover_url ?? undefined,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { '@type': 'Person', name: site.creator },
          publisher: { '@type': 'Organization', name: site.shortName, logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') } },
          mainEntityOfPage: url,
        }}
      />
    </article>
  );
}
