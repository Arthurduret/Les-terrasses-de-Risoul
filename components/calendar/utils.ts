export const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Format local (pas toISOString, qui bascule en UTC et peut décaler le jour).
export function formatISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse un "YYYY-MM-DD" en Date locale (pas new Date(string), qui
// interprète les dates sans heure comme UTC minuit et peut décaler le
// jour affiché selon le fuseau du serveur).
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatMonthLabel(date: Date): string {
  const label = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatLongDate(date: Date): string {
  const label = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Grille du mois en semaines de 7 jours, alignée lundi → dimanche.
export function getMonthMatrix(monthDate: Date): (Date | null)[][] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // getDay(): 0 = dimanche ... 6 = samedi → décalage pour semaine commençant lundi.
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  const days: (Date | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function rangeHasBlockedDay(
  start: Date,
  end: Date,
  blockedDates: Set<string>
): boolean {
  const cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor.getTime() <= last.getTime()) {
    if (blockedDates.has(formatISO(cursor))) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

// Premier jour indisponible strictement après `start`, sur un horizon de 2 ans.
export function firstBlockedAfter(
  start: Date,
  blockedDates: Set<string>
): Date | null {
  const cursor = startOfDay(start);
  cursor.setDate(cursor.getDate() + 1);
  const horizon = new Date(start);
  horizon.setFullYear(horizon.getFullYear() + 2);

  while (cursor.getTime() <= horizon.getTime()) {
    if (blockedDates.has(formatISO(cursor))) return new Date(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}
