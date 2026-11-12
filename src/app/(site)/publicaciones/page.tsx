import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Pagination from '@/components/Pagination';
import { EmptyState, PostCard } from '@/components/Cards';
import { getPosts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Todas las publicaciones',
  description: 'Mods, shaders, tutoriales, novedades y curiosidades de Minecraft en Todo un Cubo.',
  alternates: { canonical: '/publicaciones' },
};

export default async function PostsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const page = Number((await searchParams).pagina) || 1;
  const posts = await getPosts({ limit: 12, page });
  return (
    <>
      <PageHero eyebrow="Blog" title="Publicaciones" description="Todo lo nuevo de Todo un Cubo, de más reciente a más antiguo." crumbs={[{ href: '/publicaciones', label: 'Publicaciones' }]} />
      <div className="container-cubo py-10">
        {posts.items.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.items.map((p, i) => <PostCard key={p.id} post={p} priority={i < 3} />)}
          </div>
        ) : (
          <EmptyState title="Sin publicaciones todavía" />
        )}
        <Pagination page={posts.page} total={posts.total} pageSize={posts.pageSize} basePath="/publicaciones" />
      </div>
    </>
  );
}
