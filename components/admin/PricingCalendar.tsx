"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { assignPricingWeeks } from "@/app/admin/(protected)/actions/pricing";
import { PricingWeekAssignModal, RECURRING_YEARS } from "./PricingWeekAssignModal";
import {
  WEEKDAY_LABELS,
  addMonths,
  formatISO,
  formatMonthLabel,
  getMonthMatrix,
  parseISODate,
  startOfDay,
  startOfMonth,
  startOfWeekSaturday,
} from "@/components/calendar/utils";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

interface PricingCalendarProps {
  rules: PricingRule[];
  // Date de début de semaine (samedi, ISO) -> id du tarif assigné.
  initialAssignments: Record<string, string>;
}

const FALLBACK_COLOR = "#c79267";

// Calendrier de tarifs partagé (pas un par tarif) : chaque semaine
// (samedi à samedi) est colorée selon le tarif qui lui est assigné.
// Glisser une plage sélectionne des semaines entières (peu importe le
// jour exact survolé, on retombe toujours sur leur samedi de départ),
// puis une popup propose d'y appliquer un tarif — même mécanique de
// glisser que AvailabilityEditor (pointerdown/pointermove/pointerup sur
// des cellules [data-date], refs pour lire la valeur la plus fraîche au
// relâchement).
export function PricingCalendar({ rules, initialAssignments }: PricingCalendarProps) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(startOfDay(new Date()))
  );
  const [dragAnchor, setDragAnchor] = useState<Date | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedWeeks, setSelectedWeeks] = useState<Date[] | null>(null);
  const [pending, setPending] = useState(false);
  const dragAnchorRef = useRef<Date | null>(null);
  const dragCurrentRef = useRef<Date | null>(null);

  useEffect(() => {
    dragAnchorRef.current = dragAnchor;
  }, [dragAnchor]);
  useEffect(() => {
    dragCurrentRef.current = dragCurrent;
  }, [dragCurrent]);

  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const secondMonth = addMonths(visibleMonth, 1);
  const thirdMonth = addMonths(visibleMonth, 2);

  const dragWeekRange = useMemo(() => {
    if (!dragAnchor) return null;
    const anchorWeek = startOfWeekSaturday(dragAnchor);
    const currentWeek = startOfWeekSaturday(dragCurrent ?? dragAnchor);
    return anchorWeek.getTime() <= currentWeek.getTime()
      ? { start: anchorWeek, end: currentWeek }
      : { start: currentWeek, end: anchorWeek };
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
      const anchor = dragAnchorRef.current;
      const current = dragCurrentRef.current ?? anchor;
      setDragAnchor(null);
      setDragCurrent(null);
      if (!anchor || !current) return;

      const anchorWeek = startOfWeekSaturday(anchor);
      const currentWeek = startOfWeekSaturday(current);
      const start = anchorWeek.getTime() <= currentWeek.getTime() ? anchorWeek : currentWeek;
      const finish = anchorWeek.getTime() <= currentWeek.getTime() ? currentWeek : anchorWeek;

      const weeks: Date[] = [];
      const cursor = new Date(start);
      while (cursor.getTime() <= finish.getTime()) {
        weeks.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 7);
      }
      setSelectedWeeks(weeks);
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

  async function handleAssign(ruleId: string | null, recurYearly: boolean) {
    if (!selectedWeeks) return;

    // +364 jours = exactement 52 semaines : toujours un samedi, contrairement
    // à "même date l'an prochain" qui dérive du jour de la semaine.
    const weeksToAssign =
      ruleId && recurYearly
        ? Array.from({ length: RECURRING_YEARS }, (_, year) =>
            selectedWeeks.map((week) => {
              const shifted = new Date(week);
              shifted.setDate(shifted.getDate() + year * 364);
              return shifted;
            })
          ).flat()
        : selectedWeeks;

    const weekIsos = weeksToAssign.map(formatISO);
    setPending(true);

    setAssignments((prev) => {
      const next = { ...prev };
      weekIsos.forEach((iso) => {
        if (ruleId) next[iso] = ruleId;
        else delete next[iso];
      });
      return next;
    });

    await assignPricingWeeks(weekIsos, ruleId);
    setPending(false);
    setSelectedWeeks(null);
  }

  function colorForWeek(weekStartIso: string): string | null {
    const ruleId = assignments[weekStartIso];
    if (!ruleId) return null;
    return rules.find((r) => r.id === ruleId)?.color ?? FALLBACK_COLOR;
  }

  function renderMonth(monthDate: Date) {
    const weeks = getMonthMatrix(monthDate);
    return (
      <div>
        <p className="mb-3 text-center font-display text-base capitalize text-foreground">
          {formatMonthLabel(monthDate)}
        </p>
        <div className="mb-1 grid grid-cols-7 text-center text-[10px] text-mist-800">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="grid select-none grid-cols-7 gap-0.5 touch-none">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              if (!date) return <div key={`${weekIndex}-${dayIndex}`} />;

              const iso = formatISO(date);
              const dayWeekStart = startOfWeekSaturday(date);
              const weekStartIso = formatISO(dayWeekStart);
              const color = colorForWeek(weekStartIso);

              const inDrag =
                isDragging &&
                dragWeekRange !== null &&
                dayWeekStart.getTime() >= dragWeekRange.start.getTime() &&
                dayWeekStart.getTime() <= dragWeekRange.end.getTime();
              const inSelection =
                selectedWeeks?.some((w) => isSameTime(w, dayWeekStart)) ?? false;

              return (
                <button
                  key={iso}
                  type="button"
                  data-date={iso}
                  onPointerDown={() => handlePointerDown(date)}
                  style={color ? { backgroundColor: `${color}4d` } : undefined}
                  className={`flex h-9 cursor-pointer items-center justify-center rounded-[4px] text-xs transition-colors ${
                    inDrag || inSelection
                      ? "ring-2 ring-wood-300"
                      : "hover:ring-1 hover:ring-foreground/25"
                  } ${color ? "text-foreground" : "text-mist-300"}`}
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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {renderMonth(visibleMonth)}
        <div className="hidden md:block">{renderMonth(secondMonth)}</div>
        <div className="hidden md:block">{renderMonth(thirdMonth)}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-mist-500">
        {rules.map((rule) => (
          <span key={rule.id} className="inline-flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: rule.color ?? FALLBACK_COLOR }}
            />
            {rule.label}
          </span>
        ))}
        {rules.length === 0 && (
          <span>Ajoutez un tarif ci-dessous pour pouvoir peindre le calendrier.</span>
        )}
      </div>

      <p className="mt-4 text-sm text-mist-600">
        Glissez pour sélectionner une ou plusieurs semaines, puis choisissez
        le tarif à leur appliquer.
      </p>

      <PricingWeekAssignModal
        weeks={selectedWeeks ?? []}
        rules={rules}
        pending={pending}
        onAssign={handleAssign}
        onClose={() => setSelectedWeeks(null)}
      />
    </div>
  );
}

function isSameTime(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}
