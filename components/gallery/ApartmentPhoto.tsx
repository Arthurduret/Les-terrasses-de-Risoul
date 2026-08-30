"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ApartmentPhotoProps {
  src: string;
  alt: string;
  className?: string;
  /** Photo visible d'emblée (hero) : chargée sans attendre, en priorité haute. */
  priority?: boolean;
  /**
   * Largeur d'affichage prévue, pour que le navigateur choisisse la bonne
   * variante. Défaut : pleine largeur de l'écran.
   */
  sizes?: string;
}

// Largeurs produites par scripts/generate-image-variants.mjs.
const LARGEURS = [640, 1024];

function sansExtension(src: string) {
  return src.replace(/\.jpe?g$/i, "");
}

// Un mobile de 375 px n'a aucune raison de télécharger une image de 1600 px.
// srcSet laisse le navigateur choisir : la variante 640 sur téléphone, 1024
// sur tablette, la pleine résolution sur grand écran.
function srcSetWebp(src: string) {
  const base = sansExtension(src);
  if (base === src) return undefined; // pas un JPEG : pas de variantes
  return [
    ...LARGEURS.map((l) => `${base}-w${l}.webp ${l}w`),
    `${base}.webp 1600w`,
  ].join(", ");
}

// Affiche la photo en WebP quand elle existe, sinon retombe sur le JPEG
// d'origine, sinon sur un placeholder (bloc + icône). Cette cascade garde
// la convention du projet : déposer un fichier .jpeg dans
// /public/images/apartment/ suffit — les variantes WebP sont un bonus
// généré au build, jamais une condition d'affichage.
export function ApartmentPhoto({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
}: ApartmentPhotoProps) {
  const [current, setCurrent] = useState(() => `${sansExtension(src)}.webp`);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const enWebp = current !== src;

  useEffect(() => {
    setCurrent(`${sansExtension(src)}.webp`);
    setFailed(false);
  }, [src]);

  const handleError = useCallback(() => {
    // Variante WebP absente : on retombe sur le JPEG, sans srcSet.
    // JPEG absent aussi : placeholder.
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
      srcSet={enWebp ? srcSetWebp(src) : undefined}
      sizes={enWebp ? sizes : undefined}
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
