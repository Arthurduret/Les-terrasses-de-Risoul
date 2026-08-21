import { getInitial, type LocalBusiness } from "./local-businesses";

interface LocalBusinessCardProps {
  business: LocalBusiness;
}

// Micro-animation discrète au survol (légère translation + halo sur le
// badge) plutôt qu'une animation permanente — le site doit rester premium,
// pas clignotant.
export function LocalBusinessCard({ business }: LocalBusinessCardProps) {
  return (
    <div className="group border border-foreground/10 bg-anthracite-800 p-6 transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:border-wood-500/45">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-wood-500/50 font-display text-xl text-wood-500 transition-colors duration-300 group-hover:border-wood-300 group-hover:text-wood-300">
        {getInitial(business.name)}
      </div>
      <div className="mt-5 text-[11px] tracking-[0.2em] text-mist-700 uppercase">
        {business.category}
      </div>
      <div className="mt-2 font-display text-2xl text-foreground">
        {business.name}
        {business.featured && (
          <span className="ml-2 rounded-full bg-ember-600/20 px-2 py-0.5 align-middle text-[10px] font-sans font-semibold tracking-wide text-ember-500 uppercase">
            Partenaire
          </span>
        )}
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-mist-500">
        {business.description}
      </p>
    </div>
  );
}
