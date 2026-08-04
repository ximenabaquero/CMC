import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getPublishedProducts } from "@/lib/content";
import { ProductDetail } from "@/components/public/ProductDetail";
import { mediaUrl } from "@/lib/media";

export async function generateStaticParams() {
  try {
    const products = await getPublishedProducts();
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    // Si la base no responde durante el build, las rutas se generan
    // bajo demanda en la primera visita.
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
    const product = await getProductBySlug(slug);
    if (!product) return {};
    return {
      title: product.seo_title ?? product.name,
      description: product.seo_description ?? product.short_description ?? undefined,
      openGraph: {
        title: product.seo_title ?? product.name,
        description: product.seo_description ?? product.short_description ?? undefined,
        images: product.image ? [{ url: mediaUrl(product.image), alt: product.image.alt_text }] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
