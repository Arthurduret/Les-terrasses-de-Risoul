import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { HeroSlideshow } from "@/components/gallery/HeroSlideshow";
import { HeroBadges } from "@/components/hero/HeroBadges";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { LocalBusinessCard } from "@/components/activities/LocalBusinessCard";
import {
  LOCAL_BUSINESSES,
  groupBusinessesByCategory,
} from "@/components/activities/local-businesses";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { Snowfall } from "@/components/decor/Snowfall";
import { ChairliftDivider } from "@/components/decor/ChairliftDivider";
import { SkiTraceDivider } from "@/components/decor/SkiTraceDivider";
import { getBlockedDates } from "@/lib/availability";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const blockedDates = await getBlockedDates(supabase);
  const businessGroups = groupBusinessesByCategory(LOCAL_BUSINESSES);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-wood-900 py-16 sm:py-24">
        <HeroSlideshow />
        <Snowfall />
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

      <section id="disponibilites" className="py-16">
        <Container wide>
          <Reveal>
            <h2 className="text-2xl font-bold text-foreground">
              L&apos;appartement
            </h2>
            <p className="mt-2 text-foreground/70">
              Un aperçu du séjour, et vos disponibilités en un coup d&apos;œil.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
            <Reveal>
              <PhotoGallery />
            </Reveal>
            <div className="lg:sticky lg:top-8">
              <BookingWidget blockedDates={blockedDates} />
            </div>
          </div>
        </Container>
      </section>

      <ChairliftDivider />

      <section className="bg-anthracite-800 py-16">
        <Container wide>
          <Reveal>
            <h2 className="text-2xl font-bold text-foreground">
              À faire à Risoul
            </h2>
            <p className="mt-2 text-foreground/70">
              Commerces, restaurants et loisirs à deux pas de l&apos;appartement.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businessGroups.map((group, i) => (
              <Reveal key={group.category} delayMs={i * 80}>
                <LocalBusinessCard group={group} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <SkiTraceDivider />

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
