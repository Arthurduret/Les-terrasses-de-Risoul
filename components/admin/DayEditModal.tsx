"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { formatLongDate } from "@/components/calendar/utils";

type Status = "blocked" | "booked";

const CLIENT_NOTE_PREFIX = "Réservé par ";

// Le champ "nom du client" édité par l'admin n'est que le nom — le préfixe
// n'est ajouté qu'à l'enregistrement (voir buildNote). En relecture d'une
// réservation existante, on retire ce préfixe pour ne pas le dupliquer.
function extractClientName(note: string | null): string {
  if (!note) return "";
  return note.startsWith(CLIENT_NOTE_PREFIX)
    ? note.slice(CLIENT_NOTE_PREFIX.length)
    : note;
}

function noteForEdit(row: DayRow | undefined): string {
  if (!row) return "";
  return row.status === "booked" ? extractClientName(row.note) : row.note ?? "";
}

function buildNote(status: Status, note: string): string | null {
  const trimmed = note.trim();
  if (!trimmed) return null;
  return status === "booked" ? `${CLIENT_NOTE_PREFIX}${trimmed}` : trimmed;
}

interface DayRow {
  status: Status;
  note: string | null;
  updated_by: string | null;
}

interface DayEditModalProps {
  date: Date | null;
  row: DayRow | undefined;
  pending: boolean;
  onClose: () => void;
  onSave: (status: Status, note: string | null) => void;
  onRelease: () => void;
}

// Remplace les prompt()/confirm() natifs du navigateur par une fenêtre
// habillée aux couleurs du site — rendue via portail (voir le bug de
// PhotoGalleryModal : un ancêtre avec transform coincerait sinon "fixed"
// dans les limites de la section).
//
// Deux modes : "view" (une date déjà bloquée/réservée — lecture + accès
// à la modification) et "edit" (nouvelle date, ou modification d'une
// existante). Le champ texte sert de "nom du client" pour une réservation,
// de note libre pour un blocage — jamais le nom de l'admin qui agit (ça,
// c'est updated_by, affiché séparément).
export function DayEditModal({
  date,
  row,
  pending,
  onClose,
  onSave,
  onRelease,
}: DayEditModalProps) {
  const [mode, setMode] = useState<"view" | "edit">(row ? "view" : "edit");
  const [status, setStatus] = useState<Status>(row?.status ?? "blocked");
  const [note, setNote] = useState(noteForEdit(row));
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMode(row ? "view" : "edit");
    setStatus(row?.status ?? "blocked");
    setNote(noteForEdit(row));
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

  function cancelEdit() {
    if (row) {
      setStatus(row.status);
      setNote(noteForEdit(row));
      setMode("view");
    } else {
      onClose();
    }
  }

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

        {mode === "view" && row ? (
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
            {row.updated_by && (
              <p className="mt-1 text-xs text-mist-700">Par {row.updated_by}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => setMode("edit")}>
                Modifier
              </Button>
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
                {status === "booked"
                  ? "Nom du client"
                  : "Note privée (optionnel, visible uniquement dans cette console)"}
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
                onClick={() => onSave(status, buildNote(status, note))}
              >
                Enregistrer
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>
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
