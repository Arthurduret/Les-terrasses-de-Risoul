import type { Metadata } from "next";
import { Cormorant_Garamond, Barlow } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlow = Barlow({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const SITE_URL = "https://lesterrassesderisoul.fr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Les Terrasses de Risoul",
    template: "%s — Les Terrasses de Risoul",
  },
  description:
    "Appartement au ski à Risoul 1850 — location à la semaine, à 250 m des pistes. Disponibilités, tarifs et demande de réservation en ligne.",
  keywords: [
    "location Risoul",
    "appartement Risoul 1850",
    "location vacances ski Hautes-Alpes",
    "location saisonnière Risoul",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Les Terrasses de Risoul",
    title: "Les Terrasses de Risoul",
    description:
      "Appartement au ski à Risoul 1850 — location à la semaine, à 250 m des pistes.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
