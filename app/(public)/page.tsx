import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { HeroSlideshow } from "@/components/gallery/HeroSlideshow";
import { HeroBadges } from "@/components/hero/HeroBadges";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { ACTIVITIES } from "@/components/activities/activities";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { getBlockedDates } from "@/lib/availability";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const blockedDates = await getBlockedDates(supabase);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-wood-900 py-16 sm:py-24">
        <HeroSlideshow />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40"
          aria-hidden="true"
        />
        <Container>
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-wide text-wood-300">
              Risoul, Hautes-Alpes
            </p>
            <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
              Les Terrasses de Risoul
            </h1>
            <p className="mt-4 max-w-xl text-lg text-foreground/70">
              Un appartement au pied des pistes, à louer à la semaine ou au
              week-end. Vérifiez les disponibilités et envoyez votre demande de
              réservation en quelques minutes.
            </p>
            <HeroBadges />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#disponibilites">
                <Button variant="primary">Voir les disponibilités</Button>
              </Link>
              <Link href="#contact">
                <Button variant="secondary">Nous contacter</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container wide>
          <Reveal>
            <h2 className="text-2xl font-bold text-foreground">
              L&apos;appartement en photos
            </h2>
            <p className="mt-2 text-foreground/70">
              Un aperçu du séjour, des chambres et de la vue.
            </p>
            <div className="mt-8">
              <PhotoGallery />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-wood-900 bg-anthracite-800 py-16">
        <Container wide>
          <Reveal>
            <h2 className="text-2xl font-bold text-foreground">
              À faire à Risoul
            </h2>
            <p className="mt-2 text-foreground/70">
              Quelques idées pour profiter de la station, été comme hiver.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIVITIES.map((activity, i) => (
              <Reveal key={activity.title} delayMs={i * 80}>
                <ActivityCard activity={activity} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section id="disponibilites" className="py-16">
        <Container wide>
          <Reveal>
            <h2 className="text-2xl font-bold text-foreground">
              Disponibilités &amp; tarifs
            </h2>
            <p className="mt-2 text-foreground/70">
              Sélectionnez vos dates et le nombre de voyageurs.
            </p>
            <div className="mt-8">
              <BookingWidget blockedDates={blockedDates} />
            </div>
          </Reveal>
        </Container>
      </section>

      <section
        id="contact"
        className="border-t border-wood-900 bg-anthracite-700 py-16"
      >
        <Container>
          <Reveal>
            <h2 className="text-2xl font-bold text-foreground">
              Une question, une demande ?
            </h2>
            <p className="mt-2 max-w-xl text-foreground/70">
              Le formulaire de demande de réservation arrive bientôt. En
              attendant, vous pouvez nous écrire directement.
            </p>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
