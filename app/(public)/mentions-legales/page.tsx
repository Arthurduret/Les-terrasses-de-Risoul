import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <main className="flex-1 py-24 sm:py-32">
      <Container>
        <p className="mb-4 text-xs tracking-[0.32em] text-wood-500 uppercase">Informations légales</p>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">Mentions légales</h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-mist-500">
          <section>
            <h2 className="font-display text-xl text-foreground">Éditeur du site</h2>
            <p className="mt-2">
              Le site lesterrassesderisoul.fr est édité par [Prénom NOM — à compléter],
              particulier, domicilié à [adresse complète — à compléter], Risoul (05600),
              Hautes-Alpes, France.
            </p>
            <p className="mt-2">
              Contact :{" "}
              <a
                href="mailto:reservation@lesterrassesderisoul.fr"
                className="text-wood-500 underline underline-offset-2 hover:text-wood-300"
              >
                reservation@lesterrassesderisoul.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Directeur de la publication</h2>
            <p className="mt-2">[Prénom NOM — à compléter]</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Hébergement</h2>
            <p className="mt-2">
              Le site est hébergé par l&apos;éditeur lui-même, à l&apos;adresse
              mentionnée ci-dessus.
            </p>
            <p className="mt-2">
              La diffusion est assurée via le réseau de{" "}
              <a
                href="https://www.cloudflare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wood-500 underline underline-offset-2 hover:text-wood-300"
              >
                Cloudflare, Inc.
              </a>
              <br />
              101 Townsend St, San Francisco, CA 94107, États-Unis
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Propriété intellectuelle</h2>
            <p className="mt-2">
              L&apos;ensemble des contenus présents sur ce site (textes, photographies, logo) est
              la propriété de l&apos;éditeur, sauf mention contraire, et ne peut être reproduit
              sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Crédit</h2>
            <p className="mt-2">Conception et réalisation du site : [à compléter, le cas échéant].</p>
          </section>
        </div>
      </Container>
    </main>
  );
}
