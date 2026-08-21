"use client";

import { useEffect, useRef, useState } from "react";

interface ApartmentPhotoProps {
  src: string;
  alt: string;
  className?: string;
}

// Affiche la vraie photo si le fichier existe dans /public/images/apartment/,
// sinon retombe automatiquement sur un placeholder (bloc + icône). Dès qu'un
// fichier du bon nom est déposé, le placeholder disparaît de lui-même.
export function ApartmentPhoto({ src, alt, className = "" }: ApartmentPhotoProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Le navigateur commence à charger l'image dès le HTML rendu par le
    // serveur, avant que React n'attache onError côté client : sur une 404
    // très rapide (localhost), l'échec peut déjà être acté à l'hydratation.
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-anthracite-700 ${className}`}
      >
        <PhotoIcon className="h-8 w-8 text-wood-500" />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function PhotoIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.5" />
      <path d="M21 15l-5-5-4 4-3-3-6 6" />
    </svg>
  );
}
