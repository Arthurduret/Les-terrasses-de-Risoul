"use client";

import { useState } from "react";
import {
  WEEKDAY_LABELS,
  addMonths,
  formatISO,
  formatMonthLabel,
  formatShortDate,
  getMonthMatrix,
  isSameDay,
  parseISODate,
  startOfMonth,
} from "@/components/calendar/utils";

interface PricingDateRangePickerProps {
  defaultStart?: string | null;
  defaultEnd?: string | null;
}

// Sélection de période directement au clic sur le calendrier, plutôt que de
// taper des dates dans un champ — mêmes champs cachés season_start/
// season_end que consomment déjà les actions serveur du formulaire parent.
export function PricingDateRangePicker({
  defaultStart,
  defaultEnd,
}: PricingDateRangePickerProps) {
  const [start, setStart] = useState<Date | null>(
    defaultStart ? parseISODate(defaultStart) : null
  );
  const [end, setEnd] = useState<Date | null>(
    defaultEnd ? parseISODate(defaultEnd) : null
  );
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(start ?? new Date())
  );
  const secondMonth = addMonths(visibleMonth, 1);

  function handleDayClick(date: Date) {
    if (!start || (start && end)) {
      setStart(date);
      setEnd(null);
      return;
    }
    if (date.getTime() <= start.getTime()) {
      setStart(date);
      return;
    }
    setEnd(date);
  }

  function renderMonth(monthDate: Date) {
    const weeks = getMonthMatrix(monthDate);
    return (
      <div>
        <p className="mb-3 text-center font-display text-sm capitalize text-foreground">
          {formatMonthLabel(monthDate)}
        </p>
        <div className="mb-1 grid grid-cols-7 text-center text-[10px] text-mist-800">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              if (!date) return <div key={`${weekIndex}-${dayIndex}`} />;

              const isStart = start ? isSameDay(date, start) : false;
              const isEnd = end ? isSameDay(date, end) : false;
              const inRange =
                start && end
                  ? date.getTime() > start.getTime() && date.getTime() < end.getTime()
                  : false;

              let cls =
                "flex h-8 items-center justify-center rounded-[4px] text-xs transition-colors cursor-pointer ";
              if (isStart || isEnd) cls += "bg-wood-500 text-background font-semibold ";
              else if (inRange) cls += "bg-wood-500/25 text-foreground ";
              else cls += "text-mist-300 hover:ring-1 hover:ring-foreground/25 ";

              return (
                <button
                  key={formatISO(date)}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={cls}
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm text-mist-400">
          {start ? formatShortDate(start) : "Date de début"} →{" "}
          {end ? formatShortDate(end) : "Date de fin"}
        </span>
        <div className="flex items-center gap-2">
          {(start || end) && (
            <button
              type="button"
              onClick={() => {
                setStart(null);
                setEnd(null);
              }}
              className="text-xs text-wood-500 underline underline-offset-2 hover:text-wood-300"
            >
              Effacer
            </button>
          )}
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
            aria-label="Mois précédent"
            className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-foreground/18 text-mist-300 hover:border-wood-500 hover:text-foreground"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            aria-label="Mois suivant"
            className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-foreground/18 text-mist-300 hover:border-wood-500 hover:text-foreground"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {renderMonth(visibleMonth)}
        {renderMonth(secondMonth)}
      </div>

      <input type="hidden" name="season_start" value={start ? formatISO(start) : ""} />
      <input type="hidden" name="season_end" value={end ? formatISO(end) : ""} />
    </div>
  );
}
