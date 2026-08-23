"use client";

import { useEffect, useRef } from "react";
import { LOCAL_BUSINESSES, getInitial } from "./local-businesses";

// Distance de scroll (en vh) consacrée à chaque commerce avant de passer
// au suivant — tunable indépendamment de la hauteur visuelle des cartes.
const VH_PER_CARD = 62;
const TOTAL = LOCAL_BUSINESSES.length;

// Version bureau de "À faire à Risoul" : une section épinglée (position:
// sticky) pendant que la page défile sur une hauteur de plusieurs écrans ;
// un rail de cabines-cartes glisse verticalement au même rythme (scroll
// + rAF, transform posé en style direct — même technique que
// SkiTraceDivider/AutoRefresh, pas de re-render React sur le défilement).
// Repli mobile : la grille de cartes classique (LocalBusinessCard), gérée
// par le parent via un simple md:hidden/hidden md:block.
export function ChairliftCarousel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let ticking = false;

    function update() {
      const rect = wrap!.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const progress = span > 0 ? Math.max(0, Math.min(1, -rect.top / span)) : 0;

      const band = track!.parentElement;
      const dist = band ? Math.max(0, track!.scrollHeight - band.clientHeight) : 0;
      track!.style.transform = `translate3d(0, ${(-progress * dist).toFixed(2)}px, 0)`;

      if (counterRef.current) {
        const n = Math.min(TOTAL, 1 + Math.round(progress * (TOTAL - 1)));
        counterRef.current.textContent = `${String(n).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`;
      }
    }

    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative hidden md:block"
      style={{ height: `${100 + TOTAL * VH_PER_CARD}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="flex-none px-[clamp(20px,5vw,72px)] pt-[clamp(22px,3.6vh,48px)]">
          <div className="mx-auto max-w-[1320px]">
            <p className="mb-3.5 text-xs tracking-[0.32em] text-wood-500 uppercase">
              À faire à Risoul
            </p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="max-w-xl font-display text-4xl text-foreground sm:text-5xl">
                  La station, à deux pas de la porte
                </h2>
                <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-mist-500">
                  Commerces, tables et activités accessibles à pied depuis
                  l&apos;appartement. Continuez à faire défiler : le
                  télésiège les fait défiler un par un.
                </p>
              </div>
              <span
                ref={counterRef}
                className="shrink-0 text-xs tracking-[0.16em] text-mist-700 uppercase"
              >
                {`01 / ${String(TOTAL).padStart(2, "0")}`}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-[clamp(14px,2.6vh,30px)] min-h-0 flex-1 overflow-hidden">
          <div
            className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2"
            style={{
              background:
                "linear-gradient(180deg, rgba(237,231,223,0), rgba(237,231,223,.5) 10%, rgba(237,231,223,.5) 90%, rgba(237,231,223,0))",
            }}
            aria-hidden="true"
          />

          <div
            ref={trackRef}
            className="absolute inset-x-0 top-0 flex flex-col"
            style={{ willChange: "transform" }}
            aria-hidden="true"
          >
            {LOCAL_BUSINESSES.map((business, i) => (
              <div
                key={business.id}
                className="flex h-[clamp(330px,46vh,430px)] flex-none items-start justify-center"
              >
                <div
                  className="chairlift-card-sway flex flex-col items-center"
                  style={{
                    animationDuration: `${4.6 + (i % 4) * 0.6}s`,
                    animationDelay: `${-i * 0.8}s`,
                  }}
                >
                  <div className="flex h-[clamp(38px,6vh,74px)] flex-none flex-col items-center">
                    <span className="h-[13px] w-[13px] flex-none rounded-full border-2 border-foreground/70 bg-anthracite-700" />
                    <span className="w-[3px] flex-1 bg-foreground/70" />
                    <span className="h-[11px] w-[52px] flex-none rounded-[6px] bg-foreground" />
                  </div>
                  <div className="-mt-0.5 flex-none rounded-t-[30px] rounded-b-[22px] border-[3px] border-foreground px-[clamp(16px,1.8vw,22px)] pt-[clamp(14px,2vh,20px)] pb-[clamp(12px,1.6vh,18px)]">
                    <div
                      className="w-[clamp(280px,38vw,440px)] rounded-[20px] bg-anthracite-700 px-[clamp(18px,2vw,24px)] py-[clamp(15px,2.2vh,22px)] shadow-[0_26px_44px_-30px_rgba(0,0,0,.9)]"
                    >
                      <div className="mb-[clamp(8px,1.6vh,14px)] flex items-center gap-2.5">
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-wood-500/55 font-display text-lg text-wood-500">
                          {getInitial(business.name)}
                        </span>
                        <span className="text-[10.5px] tracking-[0.2em] text-mist-700 uppercase">
                          {business.category}
                        </span>
                        <span className="ml-auto text-[10.5px] tracking-[0.18em] text-mist-800 uppercase">
                          {String(i + 1).padStart(2, "0")} · {String(TOTAL).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="mb-[7px] font-display text-[clamp(22px,2.8vh,28px)] leading-[1.15] text-foreground">
                        {business.name}
                      </div>
                      <div className="text-sm leading-relaxed text-mist-500 text-pretty">
                        {business.description}
                      </div>
                    </div>
                    <div className="mx-0.5 mt-[clamp(11px,1.6vh,16px)] flex items-center gap-2.5">
                      <span className="h-0.5 flex-1 rounded-full bg-foreground/40" />
                      <span className="h-[5px] w-[26px] rounded-[3px] bg-wood-500/90" />
                      <span className="h-0.5 flex-1 rounded-full bg-foreground/40" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
