"use client";

import { useMemo, useState } from "react";
import { formatShortDate, parseISODate, startOfDay } from "@/components/calendar/utils";

interface BookingRequestRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  status: string;
  processed_by: string | null;
}

type FilterKey = "all" | "upcoming" | "past" | "pending" | "confirmed" | "declined";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Passées" },
  { key: "pending", label: "En attente" },
  { key: "confirmed", label: "Confirmées" },
  { key: "declined", label: "Déclinées" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  declined: "Déclinée",
};

function statusColor(status: string) {
  if (status === "confirmed") return "text-wood-500";
  if (status === "declined") return "text-mist-700";
  return "text-ember-500";
}

// Vue d'ensemble "qui occupe quoi et quand" : toutes les demandes (pas
// seulement celles en attente), triées par date de séjour, avec un filtre
// simple. Utile même quand il n'y a aucune demande en attente.
export function BookingHistoryTable({
  requests,
}: {
  requests: BookingRequestRow[];
}) {
  const [filter, setFilter] = useState<FilterKey>("upcoming");
  const today = useMemo(() => startOfDay(new Date()), []);

  const sorted = useMemo(
    () => [...requests].sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [requests]
  );

  const filtered = sorted.filter((r) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return parseISODate(r.end_date).getTime() >= today.getTime();
    if (filter === "past") return parseISODate(r.end_date).getTime() < today.getTime();
    return r.status === filter;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-sm px-3 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? "bg-wood-500 text-background"
                : "border border-foreground/15 text-mist-400 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-5 text-sm text-mist-700">
          Aucune réservation dans cette vue.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-foreground/15 text-left text-xs tracking-wide text-mist-600 uppercase">
                <th className="pb-2 pr-4 font-normal">Voyageur</th>
                <th className="pb-2 pr-4 font-normal">Contact</th>
                <th className="pb-2 pr-4 font-normal">Dates</th>
                <th className="pb-2 pr-4 font-normal">Statut</th>
                <th className="pb-2 font-normal">Traité par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-4 text-foreground">{r.name}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-mist-400">
                    {r.email} · {r.phone}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-mist-400">
                    {formatShortDate(parseISODate(r.start_date))} →{" "}
                    {formatShortDate(parseISODate(r.end_date))}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={statusColor(r.status)}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="py-3 whitespace-nowrap text-mist-600">
                    {r.processed_by ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
