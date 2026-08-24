import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
};

export default function CgvPage() {
  return (
    <main className="flex-1 py-24 sm:py-32">
      <Container>
        <p className="mb-4 text-xs tracking-[0.32em] text-wood-500 uppercase">Réservation</p>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          Conditions générales de vente
        </h1>

        <div className="mt-8 border border-ember-600/40 bg-ember-600/10 p-4 text-sm text-mist-400">
          <strong className="text-foreground">Brouillon à valider.</strong> Ce texte est un modèle
          standard (acompte, annulation) fourni à titre de point de départ — à relire et ajuster
          avant utilisation, notamment les pourcentages et délais.
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-mist-500">
          <section>
            <h2 className="font-display text-xl text-foreground">Objet</h2>
            <p className="mt-2">
              Les présentes conditions régissent la location saisonnière de l&apos;appartement
              « Les Terrasses de Risoul », situé à Risoul (05600), entre son propriétaire et le
              client ayant effectué une demande de réservation via ce site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Processus de réservation</h2>
            <p className="mt-2">
              Toute demande soumise via le formulaire du site constitue une demande de
              réservation, non un engagement ferme. Elle est confirmée manuellement par le
              propriétaire, qui envoie alors un email de confirmation accompagné du contrat de
              location et des modalités de paiement de l&apos;acompte.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Acompte et solde</h2>
            <p className="mt-2">
              Un acompte de 30 % du montant total est demandé à la confirmation de la réservation.
              Le solde est dû au plus tard 30 jours avant la date d&apos;arrivée. Pour une
              réservation effectuée à moins de 30 jours de l&apos;arrivée, le montant total est
              exigible immédiatement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Annulation par le client</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Plus de 30 jours avant l&apos;arrivée : remboursement de l&apos;acompte.</li>
              <li>
                Entre 30 et 14 jours avant l&apos;arrivée : 50 % de l&apos;acompte conservé.
              </li>
              <li>Moins de 14 jours avant l&apos;arrivée : acompte non remboursable.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Taxe de séjour et ménage</h2>
            <p className="mt-2">
              La taxe de séjour, calculée par nuit et par adulte (les mineurs en sont exonérés),
              ainsi que le forfait ménage de fin de séjour si demandé, sont indiqués lors de la
              demande de réservation et détaillés dans l&apos;email de confirmation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Arrivée et départ</h2>
            <p className="mt-2">
              Sauf indication contraire communiquée avec la confirmation, l&apos;arrivée se fait à
              partir de 15h00 et le départ avant 11h00.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Litiges</h2>
            <p className="mt-2">
              Les présentes conditions sont soumises au droit français. En cas de litige, le
              client peut recourir gratuitement à un médiateur de la consommation avant toute
              action judiciaire.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
