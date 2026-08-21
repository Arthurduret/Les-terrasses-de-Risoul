"use client";

import { useEffect, useState } from "react";
import { ApartmentPhoto } from "./ApartmentPhoto";
import { APARTMENT_PHOTOS, photoSrc } from "./photos";

const SLIDE_DURATION_MS = 6500;
const PARALLAX_FACTOR = 0.2;
const PARALLAX_MAX_PX = 60;
const slides = APARTMENT_PHOTOS.slice(0, 4);

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [parallax, setParallax] = useState(0);

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
          {slides.map((photo, i) => (
            <ApartmentPhoto
              key={photo.filename}
              src={photoSrc(photo.filename)}
              alt={photo.alt}
              className={`hero-slide h-full w-full object-cover ${i === index ? "is-active" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 right-5 z-10 flex gap-2 sm:right-8">
        {slides.map((photo, i) => (
          <button
            key={photo.filename}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Aller à la photo ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-wood-500" : "w-2 bg-foreground/35 hover:bg-foreground/55"
            }`}
          />
        ))}
      </div>
    </>
  );
}
