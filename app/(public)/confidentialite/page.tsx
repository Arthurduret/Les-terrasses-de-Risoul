import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <main className="flex-1 py-24 sm:py-32">
      <Container>
        <p className="mb-4 text-xs tracking-[0.32em] text-wood-500 uppercase">Vos données</p>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          Politique de confidentialité
        </h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-mist-500">
          <section>
            <h2 className="font-display text-xl text-foreground">Responsable du traitement</h2>
            <p className="mt-2">
              [Prénom NOM — à compléter], exploitant du site lesterrassesderisoul.fr, est
              responsable du traitement des données collectées via ce site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Données collectées</h2>
            <p className="mt-2">
              Lorsque vous soumettez une demande de réservation, nous collectons : votre nom,
              prénom, adresse postale, adresse email, numéro de téléphone, les dates de séjour
              souhaitées, le nombre d&apos;adultes et d&apos;enfants, et un message optionnel.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Finalité et base légale</h2>
            <p className="mt-2">
              Ces données sont utilisées exclusivement pour traiter votre demande de réservation,
              établir le contrat de location correspondant, calculer la taxe de séjour et vous
              contacter à ce sujet. Le traitement repose sur les mesures précontractuelles
              nécessaires à votre demande.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Destinataires</h2>
            <p className="mt-2">
              Vos données ne sont accessibles qu&apos;à l&apos;exploitant du site. Elles
              transitent par nos sous-traitants techniques : Supabase (hébergement de la base de
              données) et Resend (envoi des emails transactionnels de confirmation). Aucune donnée
              n&apos;est vendue ni utilisée à des fins publicitaires.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Durée de conservation</h2>
            <p className="mt-2">
              Les données d&apos;une demande non confirmée sont conservées 1 an. Celles d&apos;une
              réservation confirmée sont conservées le temps nécessaire aux obligations comptables
              et fiscales applicables à la location meublée.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Vos droits</h2>
            <p className="mt-2">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
              d&apos;effacement, de limitation et d&apos;opposition sur vos données. Pour l&apos;exercer,
              écrivez à{" "}
              <a
                href="mailto:reservation@lesterrassesderisoul.fr"
                className="text-wood-500 underline underline-offset-2 hover:text-wood-300"
              >
                reservation@lesterrassesderisoul.fr
              </a>
              . Vous pouvez également introduire une réclamation auprès de la CNIL (
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wood-500 underline underline-offset-2 hover:text-wood-300"
              >
                cnil.fr
              </a>
              ).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Cookies</h2>
            <p className="mt-2">
              Ce site n&apos;utilise aucun cookie de mesure d&apos;audience ni de publicité. Seuls
              des cookies techniques strictement nécessaires (maintien de la session lors de la
              connexion à l&apos;espace de gestion) sont déposés, sans consentement requis.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
