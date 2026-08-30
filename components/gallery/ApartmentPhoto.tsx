"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ApartmentPhotoProps {
  src: string;
  alt: string;
  className?: string;
  /** Photo visible d'emblée (hero) : chargée sans attendre, en priorité haute. */
  priority?: boolean;
}

// Variante WebP du même fichier, ~43 % plus légère que le JPEG.
// Renvoie la source inchangée si ce n'est pas un JPEG.
function webpVariant(src: string) {
  return src.replace(/\.jpe?g$/i, ".webp");
}

// Affiche la photo en WebP quand elle existe, sinon retombe sur le JPEG
// d'origine, sinon sur un placeholder (bloc + icône). Cette cascade garde
// la convention du projet : déposer un fichier .jpeg dans
// /public/images/apartment/ suffit — la variante WebP est un bonus, jamais
// une condition.
export function ApartmentPhoto({
  src,
  alt,
  className = "",
  priority = false,
}: ApartmentPhotoProps) {
  const [current, setCurrent] = useState(() => webpVariant(src));
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrent(webpVariant(src));
    setFailed(false);
  }, [src]);

  const handleError = useCallback(() => {
    // WebP absent : on tente le JPEG. JPEG absent aussi : placeholder.
    setCurrent((c) => (c !== src ? src : c));
    setFailed((f) => f || current === src);
  }, [current, src]);

  useEffect(() => {
    // Le navigateur commence à charger l'image dès le HTML rendu par le
    // serveur, avant que React n'attache onError côté client : sur une 404
    // très rapide (localhost), l'échec peut déjà être acté à l'hydratation.
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) {
      handleError();
    }
  }, [current, handleError]);

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
      src={current}
      alt={alt}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
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
