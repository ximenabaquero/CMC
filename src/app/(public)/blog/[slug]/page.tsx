import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts, getSiteSettings } from "@/lib/content";
import { PostArticle } from "@/components/public/PostArticle";
import { mediaUrl } from "@/lib/media";

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return {};
    return {
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? undefined,
      openGraph: {
        type: "article",
        title: post.seo_title ?? post.title,
        description: post.seo_description ?? post.excerpt ?? undefined,
        publishedTime: post.published_at ?? undefined,
        images: post.cover ? [{ url: mediaUrl(post.cover), alt: post.cover.alt_text }] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Ambos fetchers están cacheados por tag, así que las bandas de cierre no
  // añaden consultas por visita. Si alguno falla, el artículo se sirve igual:
  // sin «Sigue leyendo» y con el CTA degradado al enlace de /contacto.
  const [related, settings] = await Promise.all([
    getPublishedPosts()
      .then((posts) => posts.filter((item) => item.id !== post.id).slice(0, 3))
      .catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  return <PostArticle post={post} related={related} settings={settings} />;
}
