import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/content";
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

  return <PostArticle post={post} />;
}
