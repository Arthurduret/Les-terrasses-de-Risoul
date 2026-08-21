"use client";

import { useEffect, type ReactNode } from "react";

interface CalendarModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Toujours monté (visibilité pilotée en CSS, pas en rendu conditionnel) pour
// que la sélection en cours dans le calendrier survive à l'ouverture/fermeture.
export function CalendarModal({ open, onClose, children }: CalendarModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 items-center justify-center bg-black/70 p-4 ${
        open ? "flex" : "hidden"
      }`}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-wood-700 bg-anthracite-800 p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le calendrier"
            className="text-foreground/60 hover:text-foreground"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
