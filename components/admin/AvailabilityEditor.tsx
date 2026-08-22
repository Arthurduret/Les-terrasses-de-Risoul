"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  blockDate,
  blockDates,
  unblockDate,
  unblockDates,
} from "@/app/admin/(protected)/actions/availability";
import { DayEditModal } from "./DayEditModal";
import { RangeEditModal } from "./RangeEditModal";
import {
  WEEKDAY_LABELS,
  addMonths,
  formatISO,
  formatMonthLabel,
  getMonthMatrix,
  parseISODate,
  startOfDay,
  startOfMonth,
} from "@/components/calendar/utils";

interface Row {
  date: string;
  status: "blocked" | "booked";
  note: string | null;
}

interface AvailabilityEditorProps {
  initialRows: Row[];
}

export function AvailabilityEditor({ initialRows }: AvailabilityEditorProps) {
  const [rows, setRows] = useState<Map<string, Row>>(
    () => new Map(initialRows.map((r) => [r.date, r]))
  );
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(startOfDay(new Date()))
  );
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [rangeSelection, setRangeSelection] = useState<Date[] | null>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const secondMonth = addMonths(visibleMonth, 1);

  // Sélection par glisser : ancre = jour où le doigt/clic est posé,
  // "current" = jour survolé pendant le déplacement. Dupliqués en refs
  // pour que le handler global de relâchement lise toujours la valeur la
  // plus fraîche, sans dépendre du closure de l'effet.
  const [dragAnchor, setDragAnchor] = useState<Date | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragAnchorRef = useRef<Date | null>(null);
  const dragCurrentRef = useRef<Date | null>(null);

  useEffect(() => {
    dragAnchorRef.current = dragAnchor;
  }, [dragAnchor]);
  useEffect(() => {
    dragCurrentRef.current = dragCurrent;
  }, [dragCurrent]);

  const editingIso = editingDate ? formatISO(editingDate) : null;
  const editingRow = editingIso ? rows.get(editingIso) : undefined;
  const editingPending = editingIso ? pendingDates.has(editingIso) : false;

  const rangePending = rangeSelection
    ? rangeSelection.some((d) => pendingDates.has(formatISO(d)))
    : false;

  const dragRange = useMemo(() => {
    if (!dragAnchor) return null;
    const end = dragCurrent ?? dragAnchor;
    return dragAnchor.getTime() <= end.getTime()
      ? { start: dragAnchor, finish: end }
      : { start: end, finish: dragAnchor };
  }, [dragAnchor, dragCurrent]);

  useEffect(() => {
    if (!isDragging) return;

    function handleMove(event: PointerEvent) {
      const el = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const cell = el?.closest("[data-date]") as HTMLElement | null;
      const iso = cell?.dataset.date;
      if (iso) setDragCurrent(parseISODate(iso));
    }

    function handleUp() {
      setIsDragging(false);
      setDragAnchor(null);
      setDragCurrent(null);

      const anchor = dragAnchorRef.current;
      const current = dragCurrentRef.current ?? anchor;
      if (!anchor || !current) return;

      const start = anchor.getTime() <= current.getTime() ? anchor : current;
      const finish = anchor.getTime() <= current.getTime() ? current : anchor;

      const selected: Date[] = [];
      const cursor = new Date(start);
      while (cursor.getTime() <= finish.getTime()) {
        selected.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }

      if (selected.length === 1) {
        setEditingDate(selected[0]);
      } else if (selected.length > 1) {
        setRangeSelection(selected);
      }
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging]);

  function handlePointerDown(date: Date) {
    setDragAnchor(date);
    setDragCurrent(date);
    setIsDragging(true);
  }

  async function handleBlock(note: string | null) {
    const date = editingDate;
    if (!date) return;
    const iso = formatISO(date);
    setError(null);
    setEditingDate(null);

    setRows((prev) => {
      const next = new Map(prev);
      next.set(iso, { date: iso, status: "blocked", note });
      return next;
    });
    setPendingDates((p) => new Set(p).add(iso));
    const result = await blockDate(iso, note);
    setPendingDates((p) => {
      const next = new Set(p);
      next.delete(iso);
      return next;
    });
    if (result.error) {
      setError(result.error);
      setRows((prev) => {
        const next = new Map(prev);
        next.delete(iso);
        return next;
      });
    }
  }

  async function handleRelease() {
    const date = editingDate;
    if (!date) return;
    const iso = formatISO(date);
    const previous = rows.get(iso);
    setError(null);
    setEditingDate(null);

    setRows((prev) => {
      const next = new Map(prev);
      next.delete(iso);
      return next;
    });
    setPendingDates((p) => new Set(p).add(iso));
    const result = await unblockDate(iso);
    setPendingDates((p) => {
      const next = new Set(p);
      next.delete(iso);
      return next;
    });
    if (result.error) {
      setError(result.error);
      if (previous) {
        setRows((prev) => {
          const next = new Map(prev);
          next.set(iso, previous);
          return next;
        });
      }
    }
  }

  async function handleBulkBlock(dates: string[], note: string | null) {
    setRangeSelection(null);
    setError(null);

    setRows((prev) => {
      const next = new Map(prev);
      dates.forEach((iso) => next.set(iso, { date: iso, status: "blocked", note }));
      return next;
    });
    setPendingDates((p) => {
      const next = new Set(p);
      dates.forEach((d) => next.add(d));
      return next;
    });
    const result = await blockDates(dates, note);
    setPendingDates((p) => {
      const next = new Set(p);
      dates.forEach((d) => next.delete(d));
      return next;
    });
    if (result.error) {
      setError(result.error);
      setRows((prev) => {
        const next = new Map(prev);
        dates.forEach((iso) => next.delete(iso));
        return next;
      });
    }
  }

  async function handleBulkRelease(dates: string[]) {
    setRangeSelection(null);
    setError(null);
    const previousRows = dates
      .map((iso) => [iso, rows.get(iso)] as const)
      .filter((entry): entry is [string, Row] => Boolean(entry[1]));

    setRows((prev) => {
      const next = new Map(prev);
      dates.forEach((iso) => next.delete(iso));
      return next;
    });
    setPendingDates((p) => {
      const next = new Set(p);
      dates.forEach((d) => next.add(d));
      return next;
    });
    const result = await unblockDates(dates);
    setPendingDates((p) => {
      const next = new Set(p);
      dates.forEach((d) => next.delete(d));
      return next;
    });
    if (result.error) {
      setError(result.error);
      setRows((prev) => {
        const next = new Map(prev);
        previousRows.forEach(([iso, row]) => next.set(iso, row));
        return next;
      });
    }
  }

  function renderMonth(monthDate: Date) {
    const weeks = getMonthMatrix(monthDate);
    return (
      <div>
        <p className="mb-4 text-center font-display text-lg capitalize text-foreground">
          {formatMonthLabel(monthDate)}
        </p>
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] text-mist-800">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="grid select-none grid-cols-7 gap-1 touch-none">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              if (!date) return <div key={`${weekIndex}-${dayIndex}`} />;

              const iso = formatISO(date);
              const row = rows.get(iso);
              const isPast = date.getTime() < today.getTime();
              const isPendingDate = pendingDates.has(iso);
              const inDragRange =
                isDragging &&
                dragRange !== null &&
                date.getTime() >= dragRange.start.getTime() &&
                date.getTime() <= dragRange.finish.getTime();

              return (
                <button
                  key={iso}
                  type="button"
                  data-date={iso}
                  disabled={isPendingDate}
                  onPointerDown={() => handlePointerDown(date)}
                  title={row?.note ?? undefined}
                  className={dayClasses({
                    status: row?.status,
                    isPast,
                    isPendingDate,
                    inDragRange,
                  })}
                >
                  {date.getDate()}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
          aria-label="Mois précédent"
          className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-foreground/18 text-mist-300 hover:border-wood-500 hover:text-foreground"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
          aria-label="Mois suivant"
          className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-foreground/18 text-mist-300 hover:border-wood-500 hover:text-foreground"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {renderMonth(visibleMonth)}
        <div className="hidden md:block">{renderMonth(secondMonth)}</div>
      </div>

      {error && <p className="mt-5 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-5 text-sm text-mist-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm ring-1 ring-foreground/30" />
          Disponible
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-ember-700/70" />
          Bloqué
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-wood-500/70" />
          Réservé
        </span>
      </div>

      <DayEditModal
        date={editingDate}
        row={editingRow}
        pending={editingPending}
        onClose={() => setEditingDate(null)}
        onBlock={handleBlock}
        onRelease={handleRelease}
      />

      <RangeEditModal
        dates={rangeSelection}
        rows={rows}
        pending={rangePending}
        onClose={() => setRangeSelection(null)}
        onBlock={handleBulkBlock}
        onRelease={handleBulkRelease}
      />
    </div>
  );
}

function dayClasses({
  status,
  isPast,
  isPendingDate,
  inDragRange,
}: {
  status: "blocked" | "booked" | undefined;
  isPast: boolean;
  isPendingDate: boolean;
  inDragRange: boolean;
}) {
  const base = "flex h-11 items-center justify-center rounded-[6px] text-sm transition-colors";
  const dragRing = inDragRange ? " ring-2 ring-wood-300" : "";

  if (isPendingDate) {
    return `${base} cursor-wait opacity-50${dragRing}`;
  }
  if (status === "booked") {
    return `${base} cursor-pointer bg-wood-500/70 font-semibold text-background hover:bg-wood-500${dragRing}`;
  }
  if (status === "blocked") {
    return `${base} cursor-pointer bg-ember-700/70 text-foreground hover:bg-ember-700${dragRing}`;
  }
  return `${base} cursor-pointer text-mist-300 hover:ring-1 hover:ring-foreground/30 ${
    isPast ? "opacity-40" : ""
  }${dragRing}`;
}
