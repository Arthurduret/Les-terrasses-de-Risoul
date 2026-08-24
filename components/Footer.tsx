import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-wood-700 py-14">
      <Container wide>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-lg text-foreground">Les Terrasses de Risoul</p>
            <p className="mt-2 text-sm leading-relaxed text-mist-600">
              Appartement au pied des pistes, à Risoul 1850 — location à la semaine.
            </p>
          </div>

          <nav
            aria-label="Navigation du site"
            className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-mist-400"
          >
            <Link href="/#disponibilites" className="hover:text-foreground">
              Réserver
            </Link>
            <Link href="/#activites" className="hover:text-foreground">
              La station
            </Link>
            <Link href="/#contact" className="hover:text-foreground">
              Contact
            </Link>
          </nav>

          <nav
            aria-label="Informations légales"
            className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-mist-700"
          >
            <Link href="/mentions-legales" className="hover:text-mist-400">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-mist-400">
              Confidentialité
            </Link>
            <Link href="/cgv" className="hover:text-mist-400">
              Conditions générales de vente
            </Link>
          </nav>
        </div>

        <p className="mt-10 text-xs text-mist-800">
          © {year} Les Terrasses de Risoul. Tous droits réservés.
        </p>
      </Container>
    </footer>
  );
}
