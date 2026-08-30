import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

// Page de l'office de tourisme qui pointe toujours vers le programme de la
// semaine en cours. On renvoie chez eux plutot que de reheberger le PDF :
// c'est leur contenu, et un lien ne se perime jamais — la page se met a
// jour toute seule, sans rien a maintenir de notre cote.
const PROGRAMME_URL =
  "https://www.risoul.com/programmes-d-animation-hebdomadaires.html";

export function WeeklyProgramme() {
  return (
    <div className="border-t border-wood-700 py-16 sm:py-20">
      <Container wide>
        <Reveal>
          <div className="flex flex-col gap-6 rounded-lg border border-wood-700 bg-background p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div className="max-w-xl">
              <p className="mb-3 text-xs tracking-[0.32em] text-wood-500 uppercase">
                Chaque semaine
              </p>
              <h3 className="font-display text-2xl text-foreground sm:text-3xl">
                Le programme d&apos;animations de la station
              </h3>
              <p className="mt-3 text-base leading-relaxed text-mist-500">
                Concerts, descentes aux flambeaux, marchés, sorties nature :
                l&apos;office de tourisme publie chaque semaine le programme
                complet. Il est mis à jour avant votre arrivée.
              </p>
            </div>

            <a
              href={PROGRAMME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 self-start rounded-md border border-wood-500 px-6 py-3.5 text-xs tracking-[0.16em] text-wood-500 uppercase transition-colors hover:bg-wood-500 hover:text-background sm:self-auto"
            >
              Voir le programme
            </a>
          </div>
          <p className="mt-4 text-xs text-mist-700">
            Programme publié par l&apos;Office de Tourisme de Risoul.
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
