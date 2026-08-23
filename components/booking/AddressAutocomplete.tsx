"use client";

import { useEffect, useRef, useState } from "react";

interface AddressSuggestion {
  address: string;
  postalCode: string;
  city: string;
  label: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
}

const inputClass =
  "w-full border border-foreground/15 bg-background px-3.5 py-2.5 text-foreground placeholder:text-mist-700 focus:border-wood-500 focus:outline-none";

// Autocomplétion via l'API Adresse du gouvernement français
// (api-adresse.data.gouv.fr) — gratuite, sans clé, adaptée aux adresses
// françaises. Reste un simple champ texte si l'API est indisponible ou
// si le visiteur ne sélectionne aucune suggestion : l'autocomplétion est
// un confort, jamais une dépendance bloquante.
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`,
        { signal: controller.signal }
      )
        .then((res) => res.json())
        .then((data) => {
          const results: AddressSuggestion[] = (data.features ?? []).map(
            (feature: {
              properties: { name?: string; label: string; postcode?: string; city?: string };
            }) => ({
              address: feature.properties.name ?? feature.properties.label,
              postalCode: feature.properties.postcode ?? "",
              city: feature.properties.city ?? "",
              label: feature.properties.label,
            })
          );
          setSuggestions(results);
          setOpen(results.length > 0);
        })
        .catch(() => {
          // API indisponible : on laisse le champ texte simple, sans bloquer.
        });
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        required
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setOpen(suggestions.length > 0)}
        placeholder="Ex. 12 rue de la Paix"
        className={inputClass}
      />
      {open && (
        <ul className="absolute z-10 mt-1 w-full border border-foreground/15 bg-anthracite-800 shadow-lg">
          {suggestions.map((suggestion) => (
            <li key={suggestion.label}>
              <button
                type="button"
                onClick={() => {
                  onSelect(suggestion);
                  setOpen(false);
                }}
                className="block w-full px-3.5 py-2.5 text-left text-sm text-mist-300 hover:bg-anthracite-700 hover:text-foreground"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
