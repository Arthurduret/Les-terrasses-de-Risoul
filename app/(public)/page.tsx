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
import { getBlockedDates } from "@/lib/availability";
import { getSettings } from "@/lib/settings";
import { getWeekAssignments } from "@/lib/pricingWeeks";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export default async function HomePage() {
  const supabase = await createClient();
  const [blockedDates, settings, { data: pricingRules }, weekAssignments] = await Promise.all([
    getBlockedDates(supabase),
    getSettings(supabase),
    supabase.from("pricing_rules").select("*"),
    getWeekAssignments(supabase),
  ]);

  // Données structurées : ce que Google lit pour construire un résultat
  // enrichi (photo, équipements, capacité). Chaque champ doit rester exact —
  // une information démentie par la page dessert le référencement.
  const equipements = [
    "Wifi gratuit",
    "Parking gratuit",
    "Casier à ski",
    "Terrasse",
    "Lave-vaisselle",
    "Lave-linge",
    "Télévision",
    "Cuisine équipée",
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Les Terrasses de Risoul",
    description:
      "Appartement au ski à Risoul 1850 — location à la semaine, à 250 m des pistes.",
    url: SITE_URL,
    email: settings.contact_email || "reservation@lesterrassesderisoul.fr",
    // Sans image, pas de résultat enrichi : c'est le champ qui pèse le plus.
    image: [
      `${SITE_URL}/images/apartment/vue-drone-station-1.jpeg`,
      `${SITE_URL}/images/apartment/salon-1.jpeg`,
      `${SITE_URL}/images/apartment/cuisine-1.jpeg`,
      `${SITE_URL}/images/apartment/terrasse-1.jpeg`,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "ZAC Les Chalps",
      addressLocality: "Risoul",
      postalCode: "05600",
      addressRegion: "Hautes-Alpes",
      addressCountry: "FR",
    },
    floorSize: { "@type": "QuantitativeValue", value: 63, unitCode: "MTK" },
    numberOfRooms: 2,
    petsAllowed: false,
    // MAX_OCCUPANTS dans l'action de réservation vaut 12 : même source de
    // vérité, sinon Google annonce une capacité que le formulaire refuse.
    occupancy: { "@type": "QuantitativeValue", maxValue: 12, unitText: "personnes" },
    amenityFeature: equipements.map((nom) => ({
      "@type": "LocationFeatureSpecification",
      name: nom,
      value: true,
    })),
    ...(settings.checkin_time ? { checkinTime: settings.checkin_time } : {}),
    ...(settings.checkout_time ? { checkoutTime: settings.checkout_time } : {}),
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
            <div className="-my-2 flex gap-7 text-xs tracking-[0.16em] text-mist-400 uppercase">
              <Link href="#disponibilites" className="py-2 hover:text-foreground">
                Réserver
              </Link>
              <Link href="#activites" className="py-2 hover:text-foreground">
                La station
              </Link>
              <Link href="#contact" className="py-2 hover:text-foreground">
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
              semaine. Bois clair, grande terrasse, vue sur les montagnes.
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

      <ReservationExact
        blockedDates={blockedDates}
        pricingRules={pricingRules ?? []}
        weekAssignments={weekAssignments}
        settings={settings}
      />

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
              ci-dessus. Pour toute autre question, écrivez-nous directement
              à{" "}
              <a
                href={`mailto:${settings.contact_email || "reservation@lesterrassesderisoul.fr"}`}
                className="text-wood-500 underline underline-offset-2 hover:text-wood-300"
              >
                {settings.contact_email || "reservation@lesterrassesderisoul.fr"}
              </a>
              .
            </p>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
