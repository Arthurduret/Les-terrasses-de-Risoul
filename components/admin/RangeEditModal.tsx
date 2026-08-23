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

type Status = "blocked" | "booked";

const CLIENT_NOTE_PREFIX = "Réservé par ";

function extractClientName(note: string | null): string {
  if (!note) return "";
  return note.startsWith(CLIENT_NOTE_PREFIX)
    ? note.slice(CLIENT_NOTE_PREFIX.length)
    : note;
}

function buildNote(status: Status, note: string): string | null {
  const trimmed = note.trim();
  if (!trimmed) return null;
  return status === "booked" ? `${CLIENT_NOTE_PREFIX}${trimmed}` : trimmed;
}

interface DayRow {
  status: Status;
  note: string | null;
}

interface RangeEditModalProps {
  dates: Date[] | null;
  rows: Map<string, DayRow>;
  pending: boolean;
  onClose: () => void;
  onSave: (dates: string[], status: Status, note: string | null) => void;
  onRelease: (dates: string[]) => void;
}

// Version "plage" du DayEditModal, ouverte quand un glisser sur le
// calendrier sélectionne plusieurs jours d'un coup. S'applique à toute
// la sélection, y compris des dates déjà réservées : glisser sur une
// réservation existante permet de la modifier (nom, statut) ou de la
// libérer d'un coup, sans repasser jour par jour.
export function RangeEditModal({
  dates,
  rows,
  pending,
  onClose,
  onSave,
  onRelease,
}: RangeEditModalProps) {
  const [status, setStatus] = useState<Status>("blocked");
  const [note, setNote] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!dates) return;
    const isoList = dates.map(formatISO);
    const existing = isoList.map((iso) => rows.get(iso));
    const first = existing[0];
    // Si toute la sélection partage déjà le même statut/nom (ex. on
    // glisse sur une réservation existante en un bloc), on pré-remplit
    // pour que la modifier soit un simple renommage plutôt qu'une
    // ressaisie complète.
    const uniform =
      first !== undefined &&
      existing.every((r) => r?.status === first.status && r?.note === first.note);

    if (uniform && first) {
      setStatus(first.status);
      setNote(first.status === "booked" ? extractClientName(first.note) : first.note ?? "");
    } else {
      setStatus("blocked");
      setNote("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates]);

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
  const bookedCount = isoList.filter((iso) => rows.get(iso)?.status === "booked").length;

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
          {bookedCount > 0 &&
            ` (dont ${bookedCount} déjà réservée${bookedCount > 1 ? "s" : ""})`}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setStatus("blocked")}
            className={`flex-1 border px-3 py-2 text-sm transition-colors ${
              status === "blocked"
                ? "border-ember-600 bg-ember-700/30 text-foreground"
                : "border-foreground/15 text-mist-500 hover:text-foreground"
            }`}
          >
            Bloquer
          </button>
          <button
            type="button"
            onClick={() => setStatus("booked")}
            className={`flex-1 border px-3 py-2 text-sm transition-colors ${
              status === "booked"
                ? "border-wood-500 bg-wood-900/20 text-foreground"
                : "border-foreground/15 text-mist-500 hover:text-foreground"
            }`}
          >
            Réserver
          </button>
        </div>

        <label className="mt-4 block">
          <span className="block text-sm text-mist-400">
            {status === "booked" ? "Nom du client" : "Note privée (optionnel)"}
          </span>
          <input
            autoFocus
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={status === "booked" ? "Ex. Famille Dupont" : "Ex. Semaine perso"}
            className="mt-1.5 w-full border border-foreground/15 bg-background px-3.5 py-2.5 text-foreground focus:border-wood-500 focus:outline-none"
          />
        </label>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="primary"
            disabled={pending || (status === "booked" && !note.trim())}
            onClick={() => onSave(isoList, status, buildNote(status, note))}
          >
            {status === "booked" ? "Réserver" : "Bloquer"}{" "}
            {isoList.length > 1 ? `ces ${isoList.length} dates` : "cette date"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => onRelease(isoList)}
          >
            Libérer {isoList.length > 1 ? "ces dates" : "cette date"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
