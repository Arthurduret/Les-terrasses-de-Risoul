"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AvailabilityCalendar } from "@/components/calendar/AvailabilityCalendar";
import { CalendarModal } from "@/components/calendar/CalendarModal";
import { formatShortDate } from "@/components/calendar/utils";
import { GuestSelector } from "./GuestSelector";

interface BookingWidgetProps {
  blockedDates: string[];
}

export function BookingWidget({ blockedDates }: BookingWidgetProps) {
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isGuestsOpen, setGuestsOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGuestsOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setGuestsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isGuestsOpen]);

  const totalGuests = adults + childrenCount;
  const nights =
    range.start && range.end
      ? Math.round((range.end.getTime() - range.start.getTime()) / 86400000)
      : null;

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-wood-700 bg-anthracite-800 p-5">
      <div className="grid grid-cols-1 divide-y divide-wood-900 overflow-hidden rounded-xl border border-wood-700 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          className="p-4 text-left hover:bg-anthracite-700"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-wood-300">
            Dates
          </p>
          <p className="mt-1 text-sm text-foreground">
            {range.start
              ? `${formatShortDate(range.start)} → ${
                  range.end ? formatShortDate(range.end) : "?"
                }`
              : "Ajouter des dates"}
          </p>
        </button>

        <div className="relative" ref={guestsRef}>
          <button
            type="button"
            onClick={() => setGuestsOpen((open) => !open)}
            className="w-full p-4 text-left hover:bg-anthracite-700"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-wood-300">
              Voyageurs
            </p>
            <p className="mt-1 text-sm text-foreground">
              {totalGuests} voyageur{totalGuests > 1 ? "s" : ""}
            </p>
          </button>

          {isGuestsOpen && (
            <div className="absolute right-0 z-20 mt-2">
              <GuestSelector
                adults={adults}
                childrenCount={childrenCount}
                onChangeAdults={setAdults}
                onChangeChildren={setChildrenCount}
              />
            </div>
          )}
        </div>
      </div>

      {nights !== null && (
        <p className="mt-4 text-sm text-foreground/70">
          {nights} nuit{nights > 1 ? "s" : ""}
        </p>
      )}

      <a href="#contact" className="mt-4 block">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={!range.start || !range.end}
        >
          Demander ces dates
        </Button>
      </a>

      <CalendarModal open={isCalendarOpen} onClose={() => setCalendarOpen(false)}>
        <AvailabilityCalendar
          blockedDates={blockedDates}
          size="large"
          onSelectionChange={setRange}
        />
      </CalendarModal>
    </div>
  );
}
