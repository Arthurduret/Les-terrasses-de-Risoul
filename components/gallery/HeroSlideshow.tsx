"use client";

import { useEffect, useState } from "react";
import { ApartmentPhoto } from "./ApartmentPhoto";
import { APARTMENT_PHOTOS, photoSrc } from "./photos";

const SLIDE_DURATION_MS = 5000;
const slides = APARTMENT_PHOTOS.slice(0, 5);

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
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
  );
}
