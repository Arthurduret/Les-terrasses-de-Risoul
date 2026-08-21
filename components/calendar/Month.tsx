import {
  WEEKDAY_LABELS,
  formatISO,
  formatMonthLabel,
  getMonthMatrix,
  isSameDay,
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
        className={`mb-4 text-center font-semibold capitalize text-foreground ${
          large ? "text-lg" : ""
        }`}
      >
        {formatMonthLabel(monthDate)}
      </p>
      <div
        className={`mb-2 grid grid-cols-7 text-center text-foreground/40 ${
          large ? "text-sm" : "text-xs"
        }`}
      >
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className={`grid grid-cols-7 ${large ? "gap-y-2" : "gap-y-1"}`}>
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
            const showBand =
              Boolean(selectionStart && rangeEnd) &&
              (inRange || isStart || isEnd) &&
              !(isStart && isEnd);

            let bandClass = "";
            if (showBand) {
              bandClass = "bg-wood-900/50";
              if (isStart) bandClass += " rounded-l-full";
              if (isEnd) bandClass += " rounded-r-full";
            }

            return (
              <div key={iso} className={`flex justify-center py-0.5 ${bandClass}`}>
                <button
                  type="button"
                  disabled={unavailable}
                  onClick={() => onDayClick(date)}
                  onMouseEnter={() => onDayHover(date)}
                  className={dayButtonClasses({
                    unavailable,
                    isCap: isStart || isEnd,
                    isToday: isSameDay(date, today),
                    large,
                  })}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function dayButtonClasses({
  unavailable,
  isCap,
  isToday,
  large,
}: {
  unavailable: boolean;
  isCap: boolean;
  isToday: boolean;
  large: boolean;
}) {
  const base = large
    ? "h-12 w-12 rounded-full text-base transition-colors"
    : "h-9 w-9 rounded-full text-sm transition-colors";

  if (unavailable) {
    return `${base} text-foreground/20 line-through cursor-not-allowed`;
  }
  if (isCap) {
    return `${base} bg-ember-600 text-white font-semibold`;
  }
  return `${base} cursor-pointer text-foreground hover:bg-wood-900/60 ${
    isToday ? "ring-1 ring-wood-500" : ""
  }`;
}
