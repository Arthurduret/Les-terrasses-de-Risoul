"use client";

import { useEffect } from "react";
import { ApartmentPhoto } from "./ApartmentPhoto";
import { photoSrc, type Photo } from "./photos";

interface PhotoGalleryModalProps {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function PhotoGalleryModal({
  photos,
  index,
  onClose,
  onIndexChange,
}: PhotoGalleryModalProps) {
  const open = index !== null;

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        onIndexChange(((index ?? 0) + 1) % photos.length);
      }
      if (event.key === "ArrowLeft") {
        onIndexChange(((index ?? 0) - 1 + photos.length) % photos.length);
      }
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, index, photos.length, onClose, onIndexChange]);

  if (!open || index === null) return null;

  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/95"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-foreground/70">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la galerie"
          className="text-foreground/70 hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2 px-2 pb-4 sm:gap-6 sm:px-6">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onIndexChange((index - 1 + photos.length) % photos.length);
          }}
          aria-label="Photo précédente"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-anthracite-800/80 text-foreground hover:bg-anthracite-700"
        >
          ‹
        </button>

        <div
          className="relative flex h-[70vh] w-full max-w-3xl items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <ApartmentPhoto
            src={photoSrc(photo.filename)}
            alt={photo.alt}
            className="h-full w-full rounded-lg object-contain"
          />
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onIndexChange((index + 1) % photos.length);
          }}
          aria-label="Photo suivante"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-anthracite-800/80 text-foreground hover:bg-anthracite-700"
        >
          ›
        </button>
      </div>
    </div>
  );
}
