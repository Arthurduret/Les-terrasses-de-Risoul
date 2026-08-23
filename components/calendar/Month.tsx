import {
  WEEKDAY_LABELS,
  formatISO,
  formatMonthLabel,
  getMonthMatrix,
  isSameDay,
  isSaturday,
} from "./utils";

type CalendarSize = "default" | "large";

interface MonthProps {
  monthDate: Date;
  today: Date;
  blockedDates: Set<string>;
  selectionStart: Date | null;
  selectionEnd: Date | null;
  previewEnd: Date | null;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
  size?: CalendarSize;
}

export function Month({
  monthDate,
  today,
  blockedDates,
  selectionStart,
  selectionEnd,
  previewEnd,
  onDayClick,
  onDayHover,
  size = "default",
}: MonthProps) {
  const weeks = getMonthMatrix(monthDate);
  const rangeEnd = selectionEnd ?? previewEnd;
  const large = size === "large";

  return (
    <div>
      <p
        className={`mb-4 text-center font-display capitalize tracking-wide text-foreground ${
          large ? "text-lg" : "text-base"
        }`}
      >
        {formatMonthLabel(monthDate)}
      </p>
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] tracking-wide text-mist-800">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            if (!date) {
              return <div key={`${weekIndex}-${dayIndex}`} />;
            }

            const iso = formatISO(date);
            const isPast = date.getTime() < today.getTime();
            const isBlocked = blockedDates.has(iso);
            const unavailable = isPast || isBlocked;

            const isStart = selectionStart
              ? isSameDay(date, selectionStart)
              : false;
            const isEnd = rangeEnd ? isSameDay(date, rangeEnd) : false;
            const inRange =
              selectionStart && rangeEnd
                ? date.getTime() > selectionStart.getTime() &&
                  date.getTime() < rangeEnd.getTime()
                : false;

            // Séjours du samedi au samedi uniquement : les autres jours ne
            // sont jamais cliquables comme arrivée/départ. On les grise
            // seulement s'ils ne font pas déjà partie de la semaine en
            // cours de sélection/survol, pour ne pas casser l'affichage
            // de la période choisie.
            const notSelectable = !unavailable && !isSaturday(date);
            const dimmed = notSelectable && !inRange && !isStart && !isEnd;

            return (
              <button
                key={iso}
                type="button"
                disabled={unavailable || notSelectable}
                onClick={() => onDayClick(date)}
                onMouseEnter={() => onDayHover(date)}
                className={dayButtonClasses({
                  unavailable,
                  dimmed,
                  isCap: isStart || isEnd,
                  inRange,
                  isToday: isSameDay(date, today),
                  large,
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

function dayButtonClasses({
  unavailable,
  dimmed,
  isCap,
  inRange,
  isToday,
  large,
}: {
  unavailable: boolean;
  dimmed: boolean;
  isCap: boolean;
  inRange: boolean;
  isToday: boolean;
  large: boolean;
}) {
  const base = large
    ? "h-11 rounded-[9px] text-base transition-colors"
    : "h-10 rounded-[9px] text-sm transition-colors";

  if (unavailable) {
    return `${base} text-mist-800 line-through decoration-ember-600/70 cursor-not-allowed`;
  }
  if (dimmed) {
    return `${base} text-mist-800 cursor-default`;
  }
  if (isCap) {
    return `${base} bg-ember-600 text-white font-semibold cursor-pointer`;
  }
  if (inRange) {
    return `${base} bg-wood-900/30 text-foreground cursor-pointer`;
  }
  return `${base} cursor-pointer text-mist-300 hover:ring-1 hover:ring-foreground/30 ${
    isToday ? "ring-1 ring-wood-500" : ""
  }`;
}
