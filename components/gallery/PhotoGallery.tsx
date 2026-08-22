"use client";

import { useState } from "react";
import { ApartmentPhoto } from "./ApartmentPhoto";
import { PhotoGalleryModal } from "./PhotoGalleryModal";
import { APARTMENT_PHOTOS, APARTMENT_SPACES, getSpacePhotos, photoSrc } from "./photos";

export function PhotoGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Une tuile par espace (pas par photo) : la grille reste variée même
  // quand un espace a plusieurs photos — celles-ci restent accessibles à
  // la suite dans le carrousel/lightbox.
  const tileSpaces = APARTMENT_SPACES.slice(0, 5);

  function openSpace(spaceId: string) {
    const index = APARTMENT_PHOTOS.findIndex((photo) => photo.spaceId === spaceId);
    setLightboxIndex(index >= 0 ? index : 0);
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:grid-rows-2">
        {tileSpaces.map((space, i) => {
          const [firstPhoto] = getSpacePhotos(space);
          return (
            <button
              type="button"
              key={space.id}
              onClick={() => openSpace(space.id)}
              className={`relative overflow-hidden ${
                i === 0
                  ? "col-span-2 aspect-video sm:aspect-auto sm:row-span-2"
                  : "aspect-square"
              }`}
            >
              <ApartmentPhoto
                src={photoSrc(firstPhoto.filename)}
                alt={firstPhoto.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105"
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setLightboxIndex(0)}
        className="absolute bottom-4 right-4 border border-foreground/25 bg-background/85 px-4 py-2.5 text-xs tracking-[0.1em] text-foreground uppercase backdrop-blur-sm hover:border-wood-500"
      >
        Toutes les photos ({APARTMENT_PHOTOS.length})
      </button>

      <PhotoGalleryModal
        photos={APARTMENT_PHOTOS}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}
