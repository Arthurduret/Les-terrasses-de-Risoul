"use client";

import { useEffect, useState } from "react";
import { ApartmentPhoto } from "./ApartmentPhoto";
import { getHeroPhotos, photoSrc } from "./photos";

const SLIDE_DURATION_MS = 6500;
const PARALLAX_FACTOR = 0.2;
const PARALLAX_MAX_PX = 60;
// Sélection éditoriale de plans larges (voir HERO_SELECTION dans photos.ts),
// pas les premiers espaces de la liste au hasard.
const slides = getHeroPhotos();

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [parallax, setParallax] = useState(0);
  // Les diapos sont empilées et toutes dans le viewport : `loading="lazy"`
  // ne les differerait pas. On les monte donc au fur et à mesure, sinon le
  // premier écran télécharge les quatre photos pour n'en montrer qu'une.
  const [montees, setMontees] = useState(1);

  useEffect(() => {
    // La suivante arrive une fois la page affichée : la première transition
    // n'a lieu qu'à 6,5 s, elle a largement le temps.
    const id = setTimeout(() => setMontees((n) => Math.max(n, 2)), 1200);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    setMontees((n) => Math.max(n, Math.min(index + 2, slides.length)));
  }, [index]);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setParallax(Math.min(window.scrollY * PARALLAX_FACTOR, PARALLAX_MAX_PX));
        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-16 -bottom-16 left-0 right-0"
          style={{ transform: `translate3d(0, ${parallax}px, 0)`, willChange: "transform" }}
        >
          {slides.slice(0, montees).map((photo, i) => (
            <ApartmentPhoto
              key={photo.filename}
              src={photoSrc(photo.filename)}
              alt={photo.alt}
              // La première diapo est le plus grand élément visible au
              // chargement : elle doit partir en priorité, les suivantes non.
              priority={i === 0}
              className={`hero-slide h-full w-full object-cover ${i === index ? "is-active" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 right-3 z-10 flex sm:right-6">
        {slides.map((photo, i) => (
          <button
            key={photo.filename}
            type="button"
            onClick={() => {
              setMontees(slides.length);
              setIndex(i);
            }}
            aria-label={`Aller à la photo ${i + 1}`}
            // La pastille visible fait 8 px : trop petite pour un doigt.
            // Le padding porte la zone tactile a 24 px sans changer le
            // rendu, seuil minimal des criteres d'accessibilite.
            className="flex items-center justify-center p-2"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-wood-500" : "w-2 bg-foreground/35 hover:bg-foreground/55"
              }`}
            />
          </button>
        ))}
      </div>
    </>
  );
}
