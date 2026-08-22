"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { formatLongDate } from "@/components/calendar/utils";

interface DayRow {
  status: "blocked" | "booked";
  note: string | null;
}

interface DayEditModalProps {
  date: Date | null;
  row: DayRow | undefined;
  pending: boolean;
  onClose: () => void;
  onBlock: (note: string | null) => void;
  onRelease: () => void;
}

// Remplace les prompt()/confirm() natifs du navigateur par une fenêtre
// habillée aux couleurs du site — rendue via portail (voir le bug de
// PhotoGalleryModal : un ancêtre avec transform coincerait sinon "fixed"
// dans les limites de la section).
export function DayEditModal({
  date,
  row,
  pending,
  onClose,
  onBlock,
  onRelease,
}: DayEditModalProps) {
  const [note, setNote] = useState(row?.note ?? "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setNote(row?.note ?? "");
  }, [date, row]);

  useEffect(() => {
    if (!date) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [date, onClose]);

  if (!date || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-foreground/15 bg-anthracite-800 p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-xl text-foreground">
          {formatLongDate(date)}
        </p>

        {row ? (
          <>
            <p className="mt-3 text-sm text-mist-500">
              {row.status === "booked" ? "Réservée" : "Bloquée"}
              {row.note && (
                <>
                  {" "}
                  — <span className="text-foreground">« {row.note} »</span>
                </>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="primary"
                disabled={pending}
                onClick={onRelease}
              >
                Rendre disponible
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </>
        ) : (
          <>
            <label className="mt-4 block">
              <span className="block text-sm text-mist-400">
                Note privée (optionnel, visible uniquement dans cette
                console)
              </span>
              <input
                autoFocus
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ex. Réservé par Tonton Michel"
                className="mt-1.5 w-full border border-foreground/15 bg-background px-3.5 py-2.5 text-foreground focus:border-wood-500 focus:outline-none"
              />
            </label>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="primary"
                disabled={pending}
                onClick={() => onBlock(note.trim() || null)}
              >
                Bloquer cette date
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
