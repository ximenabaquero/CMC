import { unstable_cache } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/revalidate";
import type {
  BlogPost,
  Brand,
  CompanyContent,
  Faq,
  MediaAsset,
  PillarItem,
  Product,
  ProductCategory,
  SiteSettings,
} from "@/lib/supabase/types";

/**
 * Fetchers del contenido PÚBLICO.
 *
 * Estrategia anti-pausado de Supabase:
 *  - Todo se cachea con unstable_cache + tags, SIN revalidación
 *    periódica: la base solo se consulta al generar/regenerar una
 *    página, no en cada visita.
 *  - El panel admin revalida bajo demanda tras cada cambio.
 *  - Si Supabase falla, los fetchers LANZAN (nunca se cachea un
 *    resultado de error). Las páginas ya generadas siguen sirviendo
 *    la última versión guardada en el caché incremental; una página
 *    que nunca se generó muestra un estado de error elegante.
 */

class ContentUnavailableError extends Error {
  constructor(entity: string) {
    super(`No se pudo cargar ${entity} desde la base de datos.`);
    this.name = "ContentUnavailableError";
  }
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) throw new ContentUnavailableError("la configuración del sitio");
    return data;
  },
  ["site-settings"],
  { tags: [CACHE_TAGS.settings] }
);

export const getPublishedSections = unstable_cache(
  async (): Promise<Record<string, CompanyContent>> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from("company_content").select("*");
    if (error) throw new ContentUnavailableError("el contenido institucional");
    return Object.fromEntries((data ?? []).map((section) => [section.section_key, section]));
  },
  ["company-content"],
  { tags: [CACHE_TAGS.content] }
);

export function extractPillars(section: CompanyContent | undefined): PillarItem[] {
  const data = section?.data;
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: PillarItem[] }).items;
  }
  return [];
}

export interface ProductWithImage extends Product {
  image: MediaAsset | null;
  category: ProductCategory | null;
}

async function fetchPublishedProducts(): Promise<ProductWithImage[]> {
  const supabase = createSupabasePublicClient();
  const [{ data: products, error }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("sort_order"),
    supabase.from("product_categories").select("*").order("sort_order"),
  ]);
  if (error) throw new ContentUnavailableError("el catálogo de productos");

  const imageIds = (products ?? [])
    .map((p) => p.main_image_id)
    .filter((id): id is string => Boolean(id));
  const { data: images } = imageIds.length
    ? await supabase.from("media_assets").select("*").in("id", imageIds)
    : { data: [] as MediaAsset[] };

  const imageById = new Map((images ?? []).map((img) => [img.id, img]));
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]));

  const resolved = (products ?? []).map((product) => ({
    ...product,
    image: product.main_image_id ? (imageById.get(product.main_image_id) ?? null) : null,
    category: product.category_id ? (categoryById.get(product.category_id) ?? null) : null,
  }));

  return sortProductsByFeatured(resolved);
}

/**
 * Orden destacado del catálogo (requerimiento 09 de la clienta, 2026-08-28):
 * los tres productos más vendidos encabezan la lista, en este orden exacto.
 * Manda sobre el `sort_order` de la base solo para ellos; el resto conserva su
 * orden (`sort` es estable). Se aplica dentro del fetcher para que la home
 * (hero + destacados) y `/productos` no puedan divergir.
 *
 * Es una constante de código, no un dato editable: si la clienta quiere
 * cambiar el podio con frecuencia, lo correcto es reordenar `sort_order` desde
 * el panel y borrar esta lista — hoy no lo pidió así y la prioridad es que el
 * orden quede fijo. Un slug que no exista en la base simplemente no hace nada.
 */
export const FEATURED_PRODUCT_SLUGS: readonly string[] = [
  "dap-alta-reposteria-ponque",
  "dap-reposteria",
  "dap-hojaldre",
];

export function sortProductsByFeatured<T extends { slug: string }>(products: T[]): T[] {
  const rank = (slug: string) => {
    const position = FEATURED_PRODUCT_SLUGS.indexOf(slug);
    return position === -1 ? FEATURED_PRODUCT_SLUGS.length : position;
  };
  return [...products].sort((a, b) => rank(a.slug) - rank(b.slug));
}

export const getPublishedProducts = unstable_cache(fetchPublishedProducts, ["products-list"], {
  tags: [CACHE_TAGS.products],
});

export interface ProductDetailData extends ProductWithImage {
  gallery: MediaAsset[];
  technicalSheet: MediaAsset | null;
}

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductDetailData | null> => {
    const supabase = createSupabasePublicClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new ContentUnavailableError("el producto");
    if (!product) return null;

    const [{ data: gallery }, { data: category }] = await Promise.all([
      supabase
        .from("product_media")
        .select("media_asset_id, sort_order")
        .eq("product_id", product.id)
        .order("sort_order"),
      product.category_id
        ? supabase.from("product_categories").select("*").eq("id", product.category_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    // Además de la galería se resuelve la ficha técnica (PDF).
    const assetIds = (gallery ?? []).map((g) => g.media_asset_id);
    if (product.technical_sheet_media_id) assetIds.push(product.technical_sheet_media_id);
    const { data: assets } = assetIds.length
      ? await supabase.from("media_assets").select("*").in("id", assetIds)
      : { data: [] as MediaAsset[] };
    const assetById = new Map((assets ?? []).map((a) => [a.id, a]));
    const orderedGallery = (gallery ?? [])
      .map((g) => assetById.get(g.media_asset_id))
      .filter((a): a is MediaAsset => Boolean(a));

    return {
      ...product,
      image: product.main_image_id ? (assetById.get(product.main_image_id) ?? null) : null,
      category: category ?? null,
      gallery: orderedGallery,
      technicalSheet: product.technical_sheet_media_id
        ? (assetById.get(product.technical_sheet_media_id) ?? null)
        : null,
    };
  },
  ["product-by-slug"],
  { tags: [CACHE_TAGS.products] }
);

export interface PostWithCover extends BlogPost {
  cover: MediaAsset | null;
}

async function fetchPublishedPosts(): Promise<PostWithCover[]> {
  const supabase = createSupabasePublicClient();
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw new ContentUnavailableError("los artículos del blog");

  const coverIds = (posts ?? [])
    .map((p) => p.cover_image_id)
    .filter((id): id is string => Boolean(id));
  const { data: covers } = coverIds.length
    ? await createSupabasePublicClient().from("media_assets").select("*").in("id", coverIds)
    : { data: [] as MediaAsset[] };
  const coverById = new Map((covers ?? []).map((c) => [c.id, c]));

  return (posts ?? []).map((post) => ({
    ...post,
    cover: post.cover_image_id ? (coverById.get(post.cover_image_id) ?? null) : null,
  }));
}

export const getPublishedPosts = unstable_cache(fetchPublishedPosts, ["posts-list"], {
  tags: [CACHE_TAGS.posts],
});

/**
 * Orden de presentación del blog: primero los artículos con portada.
 * El escenario destacado —tanto el rotador de la home como la cabecera de
 * `/blog`— es una superficie fotográfica; encabezarla con la portada
 * tipográfica mientras hay artículos con foto esperando en las miniaturas
 * malvende el contenido. `sort` es estable, así que dentro de cada grupo se
 * conserva el orden por fecha que trae el fetcher. Los artículos sin foto no
 * desaparecen: caen a las tarjetas del final de `/blog`. Se corrige cargando
 * la portada que falte desde el panel, no tocando este orden.
 */
export function sortPostsByCoverFirst(posts: PostWithCover[]): PostWithCover[] {
  return [...posts].sort((a, b) => Number(Boolean(b.cover)) - Number(Boolean(a.cover)));
}

export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<PostWithCover | null> => {
    const supabase = createSupabasePublicClient();
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new ContentUnavailableError("el artículo");
    if (!post) return null;

    const { data: cover } = post.cover_image_id
      ? await supabase.from("media_assets").select("*").eq("id", post.cover_image_id).maybeSingle()
      : { data: null };

    return { ...post, cover: cover ?? null };
  },
  ["post-by-slug"],
  { tags: [CACHE_TAGS.posts] }
);

export interface BrandWithLogo extends Brand {
  logo: MediaAsset;
}

/**
 * Marcas del carrusel de la página de inicio. Solo se devuelven
 * marcas cuyo logo pudo resolverse: una marca sin logo no aporta
 * nada visual (la acción de publicar ya lo exige, esto es defensa
 * adicional).
 */
export const getPublishedBrands = unstable_cache(
  async (): Promise<BrandWithLogo[]> => {
    const supabase = createSupabasePublicClient();
    const { data: brands, error } = await supabase.from("brands").select("*").order("sort_order");
    if (error) throw new ContentUnavailableError("las marcas aliadas");

    const logoIds = (brands ?? [])
      .map((b) => b.logo_media_id)
      .filter((id): id is string => Boolean(id));
    const { data: logos } = logoIds.length
      ? await supabase.from("media_assets").select("*").in("id", logoIds)
      : { data: [] as MediaAsset[] };
    const logoById = new Map((logos ?? []).map((l) => [l.id, l]));

    return (brands ?? []).flatMap((brand) => {
      const logo = brand.logo_media_id ? logoById.get(brand.logo_media_id) : undefined;
      return logo ? [{ ...brand, logo }] : [];
    });
  },
  ["brands-list"],
  { tags: [CACHE_TAGS.brands] }
);

export const getPublishedFaqs = unstable_cache(
  async (): Promise<Faq[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
    if (error) throw new ContentUnavailableError("las preguntas frecuentes");
    return data ?? [];
  },
  ["faqs-list"],
  { tags: [CACHE_TAGS.faqs] }
);
