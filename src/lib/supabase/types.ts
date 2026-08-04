/**
 * Tipos de la base de datos (escritos a mano a partir de
 * supabase/migrations/0001_schema.sql). Si el esquema cambia,
 * actualizar este archivo o regenerar con
 * `supabase gen types typescript`.
 */

export type PublishStatus = "DRAFT" | "PUBLISHED";
export type StorageProvider = "STATIC" | "R2";

export type ProductFeature = {
  label: string;
  value: string;
}

export type PillarItem = {
  title: string;
  description: string;
}

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "ADMIN";
  created_at: string;
  updated_at: string;
}

type MediaAssetRow = {
  id: string;
  storage_provider: StorageProvider;
  storage_path: string;
  public_url: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

type SiteSettingsRow = {
  id: number;
  company_name: string;
  slogan: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  schedule: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

type CompanyContentRow = {
  id: string;
  section_key: string;
  title: string | null;
  body: string | null;
  data: unknown;
  status: PublishStatus;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

type ProductCategoryRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  main_image_id: string | null;
  features: ProductFeature[];
  presentation: string | null;
  sort_order: number;
  status: PublishStatus;
  seo_title: string | null;
  seo_description: string | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

type ProductMediaRow = {
  id: string;
  product_id: string;
  media_asset_id: string;
  sort_order: number;
  created_at: string;
}

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_image_id: string | null;
  status: PublishStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  status: PublishStatus;
  featured: boolean;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

type Generated<Row, GeneratedKeys extends keyof Row> = Omit<Row, GeneratedKeys> &
  Partial<Pick<Row, GeneratedKeys>>;

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        ProfileRow,
        Generated<ProfileRow, "full_name" | "role" | "created_at" | "updated_at">,
        Partial<ProfileRow>
      >;
      media_assets: TableDef<
        MediaAssetRow,
        Generated<
          MediaAssetRow,
          "id" | "public_url" | "size_bytes" | "width" | "height" | "created_at" | "updated_at" | "updated_by"
        >,
        Partial<MediaAssetRow>
      >;
      site_settings: TableDef<
        SiteSettingsRow,
        Generated<SiteSettingsRow, keyof Omit<SiteSettingsRow, "company_name">>,
        Partial<SiteSettingsRow>
      >;
      company_content: TableDef<
        CompanyContentRow,
        Generated<
          CompanyContentRow,
          "id" | "title" | "body" | "data" | "status" | "internal_note" | "created_at" | "updated_at" | "updated_by"
        >,
        Partial<CompanyContentRow>
      >;
      product_categories: TableDef<
        ProductCategoryRow,
        Generated<ProductCategoryRow, "id" | "sort_order" | "created_at" | "updated_at" | "updated_by">,
        Partial<ProductCategoryRow>
      >;
      products: TableDef<
        ProductRow,
        Generated<
          ProductRow,
          | "id"
          | "short_description"
          | "description"
          | "category_id"
          | "main_image_id"
          | "features"
          | "presentation"
          | "sort_order"
          | "status"
          | "seo_title"
          | "seo_description"
          | "internal_note"
          | "created_at"
          | "updated_at"
          | "updated_by"
        >,
        Partial<ProductRow>
      >;
      product_media: TableDef<
        ProductMediaRow,
        Generated<ProductMediaRow, "id" | "sort_order" | "created_at">,
        Partial<ProductMediaRow>
      >;
      blog_posts: TableDef<
        BlogPostRow,
        Generated<
          BlogPostRow,
          | "id"
          | "excerpt"
          | "cover_image_id"
          | "status"
          | "published_at"
          | "seo_title"
          | "seo_description"
          | "internal_note"
          | "created_at"
          | "updated_at"
          | "updated_by"
        >,
        Partial<BlogPostRow>
      >;
      faqs: TableDef<
        FaqRow,
        Generated<
          FaqRow,
          "id" | "sort_order" | "status" | "featured" | "internal_note" | "created_at" | "updated_at" | "updated_by"
        >,
        Partial<FaqRow>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = ProfileRow;
export type MediaAsset = MediaAssetRow;
export type SiteSettings = SiteSettingsRow;
export type CompanyContent = CompanyContentRow;
export type ProductCategory = ProductCategoryRow;
export type Product = ProductRow;
export type ProductMedia = ProductMediaRow;
export type BlogPost = BlogPostRow;
export type Faq = FaqRow;

