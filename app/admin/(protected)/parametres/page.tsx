import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/admin/FormField";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { updateSettings } from "./actions";

export default async function AdminParametresPage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Paramètres</h1>
      <p className="mt-2 text-mist-500">
        Ces valeurs sont utilisées pour calculer le prix affiché aux
        visiteurs. Laissez un champ vide pour ne pas l&apos;utiliser.
      </p>

      <form
        action={updateSettings}
        className="mt-8 max-w-xl space-y-5 border border-foreground/10 bg-anthracite-800 p-6"
      >
        <FormField
          name="cleaning_fee"
          label="Frais de ménage (€)"
          type="number"
          step="0.01"
          defaultValue={settings.cleaning_fee}
        />
        <FormField
          name="tourist_tax_per_person_per_night"
          label="Taxe de séjour, par personne et par nuit (€)"
          type="number"
          step="0.01"
          defaultValue={settings.tourist_tax_per_person_per_night}
        />
        <FormField
          name="min_nights_booking"
          label="Nombre minimum de nuits pour réserver"
          type="number"
          defaultValue={settings.min_nights_booking}
        />
        <FormField
          name="contact_email"
          label="Email de contact affiché aux visiteurs"
          type="email"
          defaultValue={settings.contact_email}
        />
        <FormField
          name="airbnb_link"
          label="Lien vers votre annonce Airbnb (optionnel)"
          type="url"
          defaultValue={settings.airbnb_link}
        />
        <Button type="submit" variant="primary">
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
