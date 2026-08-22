"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import {
  formatISO,
  formatLongDate,
  formatShortDate,
  isSameDay,
} from "@/components/calendar/utils";

interface DayRow {
  status: "blocked" | "booked";
  note: string | null;
}

interface RangeEditModalProps {
  dates: Date[] | null;
  rows: Map<string, DayRow>;
  pending: boolean;
  onClose: () => void;
  onBlock: (dates: string[], note: string | null) => void;
  onRelease: (dates: string[]) => void;
}

// Version "plage" du DayEditModal, ouverte quand un glisser sur le
// calendrier sélectionne plusieurs jours d'un coup. Les dates déjà
// réservées ne sont jamais touchées en masse — elles restent gérables
// uniquement au clic simple, via DayEditModal.
export function RangeEditModal({
  dates,
  rows,
  pending,
  onClose,
  onBlock,
  onRelease,
}: RangeEditModalProps) {
  const [note, setNote] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setNote(""), [dates]);

  useEffect(() => {
    if (!dates) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [dates, onClose]);

  if (!dates || dates.length === 0 || !mounted) return null;

  const isoList = dates.map(formatISO);
  const bookedIsos = isoList.filter((iso) => rows.get(iso)?.status === "booked");
  const editableIsos = isoList.filter((iso) => rows.get(iso)?.status !== "booked");
  const blockedIsos = editableIsos.filter((iso) => rows.get(iso)?.status === "blocked");

  const first = dates[0];
  const last = dates[dates.length - 1];

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
          {isSameDay(first, last)
            ? formatLongDate(first)
            : `${formatShortDate(first)} → ${formatShortDate(last)}`}
        </p>
        <p className="mt-2 text-sm text-mist-500">
          {dates.length} date{dates.length > 1 ? "s" : ""} sélectionnée
          {dates.length > 1 ? "s" : ""}
        </p>

        {bookedIsos.length > 0 && (
          <p className="mt-3 text-sm text-mist-600">
            {bookedIsos.length} date{bookedIsos.length > 1 ? "s" : ""} déjà
            réservée{bookedIsos.length > 1 ? "s" : ""} dans cette sélection —
            non modifiée{bookedIsos.length > 1 ? "s" : ""} ici.
          </p>
        )}

        {editableIsos.length === 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <p className="text-sm text-mist-600">
              Toutes les dates sélectionnées sont déjà réservées.
            </p>
          </div>
        ) : (
          <>
            <label className="mt-4 block">
              <span className="block text-sm text-mist-400">
                Note privée pour le blocage (optionnel)
              </span>
              <input
                autoFocus
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ex. Semaine perso"
                className="mt-1.5 w-full border border-foreground/15 bg-background px-3.5 py-2.5 text-foreground focus:border-wood-500 focus:outline-none"
              />
            </label>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="primary"
                disabled={pending}
                onClick={() => onBlock(editableIsos, note.trim() || null)}
              >
                Bloquer {editableIsos.length > 1 ? `ces ${editableIsos.length} dates` : "cette date"}
              </Button>
              {blockedIsos.length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => onRelease(blockedIsos)}
                >
                  Libérer {blockedIsos.length > 1 ? `ces ${blockedIsos.length} dates bloquées` : "cette date bloquée"}
                </Button>
              )}
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
