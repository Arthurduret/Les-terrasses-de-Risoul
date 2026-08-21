"use client";

import { useEffect, useState } from "react";
import { ApartmentPhoto } from "./ApartmentPhoto";
import { APARTMENT_PHOTOS, photoSrc } from "./photos";

const SLIDE_DURATION_MS = 5000;
const PARALLAX_FACTOR = 0.2;
const PARALLAX_MAX_PX = 60;
const slides = APARTMENT_PHOTOS.slice(0, 5);

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
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
