"use client";

import { useActionState } from "react";
import { updateSiteSettings } from "@/actions/settings";
import { initialActionState } from "@/lib/action-state";
import type { SiteSettings } from "@/lib/supabase/types";
import { ActionFeedback, TextAreaField, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";
import { useActionToast } from "@/components/admin/toast";
import { UnsavedBadge, useAdminForm } from "@/components/admin/useAdminForm";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(updateSiteSettings, initialActionState);
  useActionToast(state);
  const { formProps, dirty } = useAdminForm(state);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form {...formProps} action={formAction} className="space-y-6">
      <fieldset className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-semibold">Datos generales</legend>
        <TextField
          label="Nombre de la empresa"
          name="company_name"
          defaultValue={settings.company_name}
          required
          maxLength={150}
          error={fieldErrors.company_name?.[0]}
        />
        <TextField
          label="Eslogan"
          name="slogan"
          defaultValue={settings.slogan}
          maxLength={200}
          error={fieldErrors.slogan?.[0]}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-semibold">Canales de contacto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Teléfono"
            name="phone"
            defaultValue={settings.phone}
            maxLength={50}
            error={fieldErrors.phone?.[0]}
          />
          <TextField
            label="WhatsApp"
            name="whatsapp"
            defaultValue={settings.whatsapp}
            maxLength={50}
            hint="Solo números con indicativo, ej.: 573001234567"
            error={fieldErrors.whatsapp?.[0]}
          />
          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            defaultValue={settings.email}
            maxLength={150}
            error={fieldErrors.email?.[0]}
          />
          <TextField
            label="Ciudad"
            name="city"
            defaultValue={settings.city}
            maxLength={100}
            error={fieldErrors.city?.[0]}
          />
        </div>
        <TextField
          label="Dirección"
          name="address"
          defaultValue={settings.address}
          maxLength={300}
          error={fieldErrors.address?.[0]}
        />
        <TextField
          label="Horario de atención"
          name="schedule"
          defaultValue={settings.schedule}
          maxLength={300}
          hint="Ej.: Lunes a viernes, 8:00 a. m. – 5:00 p. m."
          error={fieldErrors.schedule?.[0]}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-semibold">Redes sociales (opcional)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Facebook (URL)"
            name="facebook_url"
            defaultValue={settings.facebook_url}
            error={fieldErrors.facebook_url?.[0]}
          />
          <TextField
            label="Instagram (URL)"
            name="instagram_url"
            defaultValue={settings.instagram_url}
            error={fieldErrors.instagram_url?.[0]}
          />
          <TextField
            label="LinkedIn (URL)"
            name="linkedin_url"
            defaultValue={settings.linkedin_url}
            error={fieldErrors.linkedin_url?.[0]}
          />
          <TextField
            label="TikTok (URL)"
            name="tiktok_url"
            defaultValue={settings.tiktok_url}
            error={fieldErrors.tiktok_url?.[0]}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-semibold">SEO del sitio (opcional)</legend>
        <TextField
          label="Título por defecto"
          name="seo_title"
          defaultValue={settings.seo_title}
          maxLength={70}
          error={fieldErrors.seo_title?.[0]}
        />
        <TextAreaField
          label="Descripción por defecto"
          name="seo_description"
          defaultValue={settings.seo_description}
          rows={2}
          maxLength={170}
          error={fieldErrors.seo_description?.[0]}
        />
      </fieldset>

      <ActionFeedback state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>Guardar cambios</SubmitButton>
        <UnsavedBadge dirty={dirty} />
      </div>
    </form>
  );
}
