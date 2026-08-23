import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/admin/FormField";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { updateAdminName, updateSettings } from "./actions";

export default async function AdminParametresPage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Paramètres</h1>

      <section className="mt-8 max-w-xl">
        <h2 className="font-display text-xl text-foreground">Votre profil</h2>
        <p className="mt-2 text-sm text-mist-500">
          Ce nom apparaît quand vous bloquez une date ou traitez une demande,
          à la place de votre email.
        </p>
        <form
          action={updateAdminName}
          className="mt-5 space-y-5 border border-foreground/10 bg-anthracite-800 p-6"
        >
          <FormField
            name="full_name"
            label="Nom affiché"
            placeholder="Ex. Arthur"
            defaultValue={
              typeof user?.user_metadata?.full_name === "string"
                ? user.user_metadata.full_name
                : ""
            }
          />
          <Button type="submit" variant="primary">
            Enregistrer
          </Button>
        </form>
      </section>

      <h2 className="mt-12 font-display text-xl text-foreground">Tarifs et réservation</h2>
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            name="checkin_time"
            label="Heure d'arrivée"
            placeholder="Ex. 16h00"
            defaultValue={settings.checkin_time}
          />
          <FormField
            name="checkout_time"
            label="Heure de départ"
            placeholder="Ex. 12h00"
            defaultValue={settings.checkout_time}
          />
        </div>
        <p className="text-xs text-mist-700">
          Le jour de départ d&apos;un séjour reste disponible comme jour
          d&apos;arrivée pour le suivant (départ le matin, arrivée l&apos;après-midi).
        </p>
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
