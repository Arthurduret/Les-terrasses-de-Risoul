"use client";

import { useEffect, useMemo, useState } from "react";
import { Month } from "./Month";
import {
  addMonths,
  firstBlockedAfter,
  formatISO,
  formatShortDate,
  isSaturday,
  rangeHasBlockedDay,
  startOfDay,
  startOfMonth,
} from "./utils";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface AvailabilityCalendarProps {
  blockedDates: string[];
  size?: "default" | "large";
  months?: 1 | 2;
  onSelectionChange?: (range: DateRange) => void;
}

export function AvailabilityCalendar({
  blockedDates,
  size = "default",
  months = 2,
  onSelectionChange,
}: AvailabilityCalendarProps) {
  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const firstMonth = useMemo(() => startOfMonth(today), [today]);

  const [visibleMonth, setVisibleMonth] = useState(firstMonth);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSelectionChange?.({ start: selectionStart, end: selectionEnd });
    // onSelectionChange n'est volontairement pas dans les dépendances : on ne
    // veut notifier le parent que lorsque la sélection change réellement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionStart, selectionEnd]);

  const canGoPrev = visibleMonth.getTime() > firstMonth.getTime();
  const secondMonth = addMonths(visibleMonth, 1);

  const previewEnd = useMemo(() => {
    if (!selectionStart || selectionEnd || !hoverDate) return null;
    if (!isSaturday(hoverDate)) return null;
    if (hoverDate.getTime() <= selectionStart.getTime()) return null;

    const nextBlocked = firstBlockedAfter(selectionStart, blockedSet);
    if (nextBlocked && nextBlocked.getTime() <= hoverDate.getTime()) return null;
    return hoverDate;
  }, [selectionStart, selectionEnd, hoverDate, blockedSet]);

  function isDayUnavailable(date: Date) {
    return date.getTime() < today.getTime() || blockedSet.has(formatISO(date));
  }

  // Séjours à la semaine, du samedi au samedi uniquement : seul un samedi
  // peut devenir arrivée ou départ (l'écart entre deux samedis est donc
  // toujours un multiple de 7 nuits).
  function handleDayClick(date: Date) {
    if (isDayUnavailable(date) || !isSaturday(date)) return;
    setError(null);

    if (!selectionStart || selectionEnd) {
      setSelectionStart(date);
      setSelectionEnd(null);
      return;
    }

    if (date.getTime() <= selectionStart.getTime()) {
      setSelectionStart(date);
      return;
    }

    if (rangeHasBlockedDay(selectionStart, date, blockedSet)) {
      setError(
        "Cette période inclut des jours indisponibles — choisissez une date de départ plus proche."
      );
      return;
    }

    setSelectionEnd(date);
  }

  function handlePrev() {
    if (!canGoPrev) return;
    setVisibleMonth((month) => addMonths(month, -1));
  }

  function handleNext() {
    setVisibleMonth((month) => addMonths(month, 1));
  }

  function handleReset() {
    setSelectionStart(null);
    setSelectionEnd(null);
    setError(null);
  }

  const nights =
    selectionStart && selectionEnd
      ? Math.round(
          (selectionEnd.getTime() - selectionStart.getTime()) / 86400000
        )
      : null;

  const monthProps = {
    today,
    blockedDates: blockedSet,
    selectionStart,
    selectionEnd,
    previewEnd,
    onDayClick: handleDayClick,
    onDayHover: setHoverDate,
    size,
  };

  const navButtonClasses = (enabled: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-[2px] border text-mist-300 text-base leading-none transition-colors ${
      enabled
        ? "border-foreground/18 hover:border-wood-500 hover:text-foreground"
        : "cursor-not-allowed border-foreground/10 opacity-30"
    }`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Mois précédent"
          className={navButtonClasses(canGoPrev)}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Mois suivant"
          className={navButtonClasses(true)}
        >
          ›
        </button>
      </div>

      <div
        className={`grid grid-cols-1 ${months === 2 ? "md:grid-cols-2" : ""} ${
          size === "large" ? "gap-x-12 gap-y-10" : "gap-10"
        }`}
        onMouseLeave={() => setHoverDate(null)}
      >
        <Month monthDate={visibleMonth} {...monthProps} />
        {months === 2 && (
          <div className="hidden md:block">
            <Month monthDate={secondMonth} {...monthProps} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-5 text-xs text-mist-700">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-wood-900/35" aria-hidden="true" />
          Sélection
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-[#2a2022]" aria-hidden="true" />
          Indisponible
        </span>
      </div>

      <div className="mt-4 min-h-10">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!error && !selectionStart && (
          <p className="text-sm text-mist-600">
            Séjours à la semaine, du samedi au samedi.
          </p>
        )}
        {!error && selectionStart && (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-mist-400">
              {selectionEnd ? (
                <>
                  Du{" "}
                  <span className="font-semibold text-foreground">
                    {formatShortDate(selectionStart)}
                  </span>{" "}
                  au{" "}
                  <span className="font-semibold text-foreground">
                    {formatShortDate(selectionEnd)}
                  </span>{" "}
                  — {nights} nuit{nights && nights > 1 ? "s" : ""}
                </>
              ) : (
                <>
                  Arrivée le{" "}
                  <span className="font-semibold text-foreground">
                    {formatShortDate(selectionStart)}
                  </span>{" "}
                  — choisissez la date de départ
                </>
              )}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-wood-500 underline underline-offset-2 hover:text-wood-300"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
