"use client";

import { useMemo, useState } from "react";
import { blockDate, unblockDate } from "@/app/admin/(protected)/disponibilites/actions";
import {
  WEEKDAY_LABELS,
  addMonths,
  formatISO,
  formatMonthLabel,
  getMonthMatrix,
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
  const today = useMemo(() => startOfDay(new Date()), []);
  const secondMonth = addMonths(visibleMonth, 1);

  async function handleDayClick(date: Date) {
    const iso = formatISO(date);
    const row = rows.get(iso);
    setError(null);

    if (!row) {
      const note = window.prompt(
        "Note privée pour ce blocage (optionnel — visible uniquement dans cette console) :",
        ""
      );
      if (note === null) return; // annulé

      const trimmedNote = note.trim() || null;
      setRows((prev) => {
        const next = new Map(prev);
        next.set(iso, { date: iso, status: "blocked", note: trimmedNote });
        return next;
      });
      setPendingDates((p) => new Set(p).add(iso));
      const result = await blockDate(iso, trimmedNote);
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
      return;
    }

    const statusLabel = row.status === "booked" ? "réservée" : "bloquée";
    const detail = row.note ? ` — « ${row.note} »` : "";
    const confirmed = window.confirm(
      `Cette date est ${statusLabel}${detail}. La remettre disponible ?`
    );
    if (!confirmed) return;

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
      setRows((prev) => {
        const next = new Map(prev);
        next.set(iso, row);
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
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              if (!date) return <div key={`${weekIndex}-${dayIndex}`} />;

              const iso = formatISO(date);
              const row = rows.get(iso);
              const isPast = date.getTime() < today.getTime();
              const isPendingDate = pendingDates.has(iso);

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isPendingDate}
                  onClick={() => handleDayClick(date)}
                  title={row?.note ?? undefined}
                  className={dayClasses({
                    status: row?.status,
                    isPast,
                    isPendingDate,
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
    </div>
  );
}

function dayClasses({
  status,
  isPast,
  isPendingDate,
}: {
  status: "blocked" | "booked" | undefined;
  isPast: boolean;
  isPendingDate: boolean;
}) {
  const base =
    "flex h-11 items-center justify-center rounded-[6px] text-sm transition-colors";

  if (isPendingDate) {
    return `${base} cursor-wait opacity-50`;
  }
  if (status === "booked") {
    return `${base} cursor-pointer bg-wood-500/70 font-semibold text-background hover:bg-wood-500`;
  }
  if (status === "blocked") {
    return `${base} cursor-pointer bg-ember-700/70 text-foreground hover:bg-ember-700`;
  }
  return `${base} cursor-pointer text-mist-300 hover:ring-1 hover:ring-foreground/30 ${
    isPast ? "opacity-40" : ""
  }`;
}
