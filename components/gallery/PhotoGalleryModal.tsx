"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  // Portail vers document.body : un ancêtre (Reveal) applique un transform
  // pour l'animation d'apparition, ce qui redéfinirait le point de repère
  // de "position: fixed" et coincerait la modale dans la section au lieu
  // de couvrir tout l'écran.
  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!open || index === null || !mounted) return null;

  const photo = photos[index];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/97"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="text-xs tracking-[0.14em] text-mist-500 uppercase">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la galerie"
          className="text-lg text-mist-400 hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div
        className="flex flex-1 flex-col items-center justify-center px-4 pb-6 sm:px-10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex h-[78vh] w-full max-w-6xl items-center justify-center">
          <ApartmentPhoto
            src={photoSrc(photo.filename)}
            alt={photo.alt}
            className="h-full w-full object-contain"
          />

          <button
            type="button"
            onClick={() =>
              onIndexChange((index - 1 + photos.length) % photos.length)
            }
            aria-label="Photo précédente"
            className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-anthracite-800/80 text-foreground hover:bg-anthracite-700 sm:left-3"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % photos.length)}
            aria-label="Photo suivante"
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-anthracite-800/80 text-foreground hover:bg-anthracite-700 sm:right-3"
          >
            ›
          </button>
        </div>

        <p className="mt-4 text-center font-display text-lg text-foreground">
          {photo.alt}
        </p>
      </div>
    </div>,
    document.body
  );
}
