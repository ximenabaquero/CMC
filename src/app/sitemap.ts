import type { MetadataRoute } from "next";
import { getPublishedPosts, getPublishedProducts } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/nosotros`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/productos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/preguntas-frecuentes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contacto`, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const [products, posts] = await Promise.all([getPublishedProducts(), getPublishedPosts()]);
    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${base}/productos/${product.slug}`,
        lastModified: product.updated_at,
        priority: 0.8,
      })),
      ...posts.map((post) => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.updated_at,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
