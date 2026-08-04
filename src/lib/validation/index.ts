import { z } from "zod";

/** Utilidades comunes de validación (cliente y servidor). */

export const slugSchema = z
  .string()
  .trim()
  .min(1, "El slug es obligatorio.")
  .max(120, "El slug es demasiado largo.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minúsculas, números y guiones (ej.: dap-hojaldre).");

export const statusSchema = z.enum(["DRAFT", "PUBLISHED"]);

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

export const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(150),
  slug: slugSchema,
  short_description: optionalTrimmed(300),
  description: optionalTrimmed(10000),
  category_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  presentation: optionalTrimmed(300),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  status: statusSchema,
  seo_title: optionalTrimmed(70),
  seo_description: optionalTrimmed(170),
  features: z
    .array(
      z.object({
        label: z.string().trim().min(1, "La característica necesita un título.").max(120),
        value: z.string().trim().min(1, "La característica necesita un valor.").max(600),
      })
    )
    .max(20)
    .default([]),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio.").max(180),
  slug: slugSchema,
  excerpt: optionalTrimmed(300),
  body: z.string().trim().min(1, "El contenido es obligatorio.").max(50000),
  status: statusSchema,
  seo_title: optionalTrimmed(70),
  seo_description: optionalTrimmed(170),
});

export const faqSchema = z.object({
  question: z.string().trim().min(1, "La pregunta es obligatoria.").max(300),
  answer: z.string().trim().min(1, "La respuesta es obligatoria.").max(5000),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  status: statusSchema,
  featured: z.coerce.boolean().default(false),
});

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .transform((v) => (v === "" ? null : v))
  .pipe(z.union([z.string().url("Ingresa una URL válida (https://…)."), z.null()]))
  .nullable()
  .optional();

export const siteSettingsSchema = z.object({
  company_name: z.string().trim().min(1, "El nombre de la empresa es obligatorio.").max(150),
  slogan: optionalTrimmed(200),
  phone: optionalTrimmed(50),
  whatsapp: optionalTrimmed(50),
  email: z
    .string()
    .trim()
    .max(150)
    .transform((v) => (v === "" ? null : v))
    .pipe(z.union([z.string().email("Ingresa un correo válido."), z.null()]))
    .nullable()
    .optional(),
  address: optionalTrimmed(300),
  city: optionalTrimmed(100),
  schedule: optionalTrimmed(300),
  facebook_url: optionalUrl,
  instagram_url: optionalUrl,
  linkedin_url: optionalUrl,
  tiktok_url: optionalUrl,
  seo_title: optionalTrimmed(70),
  seo_description: optionalTrimmed(170),
});

export const companyContentSchema = z.object({
  title: optionalTrimmed(200),
  body: optionalTrimmed(20000),
  status: statusSchema,
  pillars: z
    .array(
      z.object({
        title: z.string().trim().min(1, "El pilar necesita un título.").max(120),
        description: z.string().trim().min(1, "El pilar necesita una descripción.").max(400),
      })
    )
    .max(12)
    .optional(),
});

export const altTextSchema = z
  .string()
  .trim()
  .min(3, "El texto alternativo es obligatorio (describe la imagen).")
  .max(300);
