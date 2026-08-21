import { ACTIVITY_ICONS } from "./icons";
import { CATEGORY_LABELS, type BusinessGroup } from "./local-businesses";

interface LocalBusinessCardProps {
  group: BusinessGroup;
}

// Micro-animation discrète au survol (légère translation + icône qui bouge
// un peu) plutôt qu'une animation permanente — cf. contrainte "prestige
// discret" du design.
export function LocalBusinessCard({ group }: LocalBusinessCardProps) {
  const Icon = ACTIVITY_ICONS[group.category];

  return (
    <div className="group rounded-xl border border-wood-700 bg-anthracite-800 p-5 transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-wood-500">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-anthracite-700 text-wood-300 transition-transform duration-300 ease-out group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold text-foreground">
        {CATEGORY_LABELS[group.category]}
      </h3>
      <ul className="mt-2 space-y-1 text-sm text-foreground/70">
        {group.businesses.map((business) => (
          <li key={business.id}>
            {business.name}
            {business.featured && (
              <span className="ml-1.5 rounded-full bg-ember-600/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ember-500">
                Partenaire
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
