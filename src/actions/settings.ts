"use server";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteSettingsSchema } from "@/lib/validation";
import {
  DB_ERROR_MESSAGE,
  actionError,
  actionSuccess,
  zodActionError,
  type ActionState,
} from "@/lib/action-state";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/revalidate";

export async function updateSiteSettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const parsed = siteSettingsSchema.safeParse({
    company_name: formData.get("company_name"),
    slogan: formData.get("slogan"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    schedule: formData.get("schedule"),
    facebook_url: formData.get("facebook_url"),
    instagram_url: formData.get("instagram_url"),
    linkedin_url: formData.get("linkedin_url"),
    tiktok_url: formData.get("tiktok_url"),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
  });

  if (!parsed.success) {
    return zodActionError(parsed.error);
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ ...parsed.data, updated_by: userId })
    .eq("id", 1);

  if (error) return actionError(DB_ERROR_MESSAGE);

  revalidatePublicContent(CACHE_TAGS.settings);
  return actionSuccess(
    "Información guardada. El sitio público solo muestra los canales de contacto que tengan datos."
  );
}
