interface GuestSelectorProps {
  adults: number;
  childrenCount: number;
  onChangeAdults: (value: number) => void;
  onChangeChildren: (value: number) => void;
  maxGuests?: number;
}

export function GuestSelector({
  adults,
  childrenCount,
  onChangeAdults,
  onChangeChildren,
  maxGuests = 6,
}: GuestSelectorProps) {
  const total = adults + childrenCount;

  return (
    <div className="w-72 rounded-xl border border-wood-700 bg-anthracite-800 p-4 shadow-xl">
      <Counter
        label="Adultes"
        sublabel="13 ans et plus"
        value={adults}
        min={1}
        max={maxGuests - childrenCount}
        onChange={onChangeAdults}
      />
      <div className="my-3 h-px bg-wood-900" />
      <Counter
        label="Enfants"
        sublabel="Moins de 13 ans"
        value={childrenCount}
        min={0}
        max={maxGuests - adults}
        onChange={onChangeChildren}
      />
      {total >= maxGuests && (
        <p className="mt-3 text-xs text-foreground/50">
          Capacité maximale : {maxGuests} voyageurs.
        </p>
      )}
    </div>
  );
}

function Counter({
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-foreground/50">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={`Retirer un ${label.toLowerCase()}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-wood-700 text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>
        <span className="w-4 text-center text-sm text-foreground">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label={`Ajouter un ${label.toLowerCase()}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-wood-700 text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
