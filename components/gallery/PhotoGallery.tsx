"use client";

import { useState } from "react";
import { ApartmentPhoto } from "./ApartmentPhoto";
import { PhotoGalleryModal } from "./PhotoGalleryModal";
import { APARTMENT_PHOTOS, APARTMENT_SPACES, getSpacePhotos, photoSrc } from "./photos";

// Une grande photo au-dessus, quatre plus petites en dessous — reprend la
// mise en page de la maquette Claude Design plutôt que la grille
// symétrique précédente. Une tuile par espace (pas par photo) : les
// éventuelles photos supplémentaires d'un espace restent accessibles à la
// suite dans le carrousel/lightbox.
export function PhotoGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [heroSpace, ...smallSpaces] = APARTMENT_SPACES.slice(0, 5);

  function openSpace(spaceId: string) {
    const index = APARTMENT_PHOTOS.findIndex((photo) => photo.spaceId === spaceId);
    setLightboxIndex(index >= 0 ? index : 0);
  }

  const [heroPhoto] = getSpacePhotos(heroSpace);

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="relative h-[clamp(280px,38vw,440px)] overflow-hidden">
        <button
          type="button"
          onClick={() => openSpace(heroSpace.id)}
          className="absolute inset-0"
        >
          <ApartmentPhoto
            src={photoSrc(heroPhoto.filename)}
            alt={heroPhoto.alt}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </button>
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="absolute bottom-4 right-4 border border-foreground/25 bg-background/85 px-4 py-2.5 text-xs tracking-[0.1em] text-foreground uppercase backdrop-blur-sm hover:border-wood-500"
        >
          Toutes les photos ({APARTMENT_PHOTOS.length})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {smallSpaces.map((space) => {
          const [firstPhoto] = getSpacePhotos(space);
          return (
            <button
              type="button"
              key={space.id}
              onClick={() => openSpace(space.id)}
              className="relative h-[clamp(130px,14vw,168px)] overflow-hidden"
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

      <PhotoGalleryModal
        photos={APARTMENT_PHOTOS}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}
