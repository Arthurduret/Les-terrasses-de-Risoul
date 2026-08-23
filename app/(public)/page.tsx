import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { HeroSlideshow } from "@/components/gallery/HeroSlideshow";
import { HeroBadges } from "@/components/hero/HeroBadges";
import { ReservationExact } from "@/components/booking/ReservationExact";
import { LocalBusinessCard } from "@/components/activities/LocalBusinessCard";
import { ChairliftCarousel } from "@/components/activities/ChairliftCarousel";
import { LOCAL_BUSINESSES } from "@/components/activities/local-businesses";
import { Snowfall } from "@/components/decor/Snowfall";
import { ChairliftDivider } from "@/components/decor/ChairliftDivider";
import { SkiTraceDivider } from "@/components/decor/SkiTraceDivider";
import { ScrollToTopSnowmobile } from "@/components/decor/ScrollToTopSnowmobile";

// NOTE : la section #disponibilites utilise temporairement le rendu "tel
// quel" du fichier reservation.html fourni (voir ReservationExact) — pas
// encore reliée aux vraies données (disponibilités, tarifs) le temps de
// retravailler les fonctionnalités par-dessus ce design.
export default function HomePage() {
  return (
    <main className="flex-1">
      <AutoRefresh />
      <ScrollToTopSnowmobile />
      <section className="relative h-screen min-h-[680px] overflow-hidden border-b border-wood-700">
        <HeroSlideshow />
        <Snowfall />
        <div
          className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-background from-5% via-background/35 via-40% to-background/85"
          aria-hidden="true"
        />

        <div className="relative z-[8] flex h-full flex-col justify-between px-5 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Logo />
            <div className="flex gap-7 text-xs tracking-[0.16em] text-mist-400 uppercase">
              <Link href="#disponibilites" className="hover:text-foreground">
                Réserver
              </Link>
              <Link href="#activites" className="hover:text-foreground">
                La station
              </Link>
              <Link href="#contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="mb-5 text-xs tracking-[0.34em] text-wood-500 uppercase">
              Appartement · Hautes-Alpes
            </p>
            <h1 className="text-5xl leading-[1.02] font-medium text-balance text-foreground sm:text-7xl font-display">
              Les Terrasses
              <br />
              de Risoul
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist-300 text-pretty">
              Un appartement chaleureux au pied des pistes, à louer à la
              semaine ou au week-end. Bois clair, grande terrasse, vue sur les
              montagnes.
            </p>
            <HeroBadges />
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="#disponibilites">
                <Button variant="primary">Voir les disponibilités</Button>
              </Link>
              <Link href="#contact">
                <Button variant="secondary">Nous contacter</Button>
              </Link>
            </div>
          </div>

          <div className="h-8" />
        </div>
      </section>

      <ReservationExact />

      <ChairliftDivider />

      <section id="activites" className="bg-anthracite-700">
        <div className="py-24 sm:py-32 md:hidden">
          <Container wide>
            <Reveal>
              <p className="mb-4 text-xs tracking-[0.32em] text-wood-500 uppercase">
                À faire à Risoul
              </p>
              <h2 className="max-w-xl font-display text-4xl text-foreground sm:text-5xl">
                La station, à deux pas de la porte
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-mist-500">
                Commerces, tables et activités accessibles à pied depuis
                l&apos;appartement.
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {LOCAL_BUSINESSES.map((business, i) => (
                <Reveal key={business.id} delayMs={(i % 3) * 80}>
                  <LocalBusinessCard business={business} />
                </Reveal>
              ))}
            </div>
          </Container>
        </div>

        <ChairliftCarousel />
      </section>

      <SkiTraceDivider />

      <section
        id="contact"
        className="border-t border-wood-700 py-24 sm:py-32"
      >
        <Container>
          <Reveal>
            <p className="mb-4 text-xs tracking-[0.32em] text-wood-500 uppercase">
              Contact
            </p>
            <h2 className="font-display text-4xl text-foreground sm:text-5xl">
              Parlons de votre séjour
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-mist-500">
              Pour réserver, choisissez vos dates dans le calendrier
              ci-dessus. Pour toute autre question, écrivez-nous directement.
            </p>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
