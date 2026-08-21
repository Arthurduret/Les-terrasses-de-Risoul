import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="border-b border-stone-200 bg-pine-50/60 py-16 sm:py-24">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-wide text-pine-700">
            Risoul, Hautes-Alpes
          </p>
          <h1 className="mt-3 text-4xl font-bold text-stone-900 sm:text-5xl">
            Les Terrasses de Risoul
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-600">
            Un appartement au pied des pistes, à louer à la semaine ou au
            week-end. Vérifiez les disponibilités et envoyez votre demande de
            réservation en quelques minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#disponibilites">
              <Button variant="primary">Voir les disponibilités</Button>
            </Link>
            <Link href="#contact">
              <Button variant="secondary">Nous contacter</Button>
            </Link>
          </div>
        </Container>
      </section>

      <section id="disponibilites" className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-stone-900">
            Disponibilités &amp; tarifs
          </h2>
          <p className="mt-2 text-stone-600">
            Le calendrier interactif arrive bientôt. En attendant, contactez-nous
            directement pour connaître les disponibilités.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-stone-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-pine-600" />
              Disponible
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-stone-400" />
              Indisponible
            </span>
          </div>
        </Container>
      </section>

      <section
        id="contact"
        className="border-t border-stone-200 bg-sky-100/50 py-16"
      >
        <Container>
          <h2 className="text-2xl font-bold text-stone-900">
            Une question, une demande ?
          </h2>
          <p className="mt-2 max-w-xl text-stone-600">
            Le formulaire de demande de réservation arrive bientôt. En
            attendant, vous pouvez nous écrire directement.
          </p>
        </Container>
      </section>
    </main>
  );
}
