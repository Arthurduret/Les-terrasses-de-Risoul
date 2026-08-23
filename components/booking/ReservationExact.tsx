"use client";

import { useEffect } from "react";

// Portage tel quel du fichier reservation.html fourni par l'utilisateur —
// mêmes classes .ltr-*, même CSS, même script (données de tarif/dispo en
// dur, 6 voyageurs max, bouton "Demander ces dates" sans action). Seules
// deux choses ont changé, par nécessité technique et non par choix de
// design : les chemins d'images (les vraies photos de l'appart, sinon
// images cassées) et les polices référencées via les variables déjà
// chargées par next/font (--font-display / --font-geist-sans) plutôt que
// re-téléchargées depuis Google Fonts. Le reste — couleurs, tailles,
// données, comportement — sera retravaillé dans un second temps.
const STYLE = `
.ltr-sec *{box-sizing:border-box}
.ltr-sec{background:#0B0B0C;color:#EDE7DF;font-family:var(--font-geist-sans),'Barlow',sans-serif;font-weight:300;padding:clamp(64px,9vw,120px) clamp(20px,5vw,72px)}
.ltr-wrap{max-width:1320px;margin:0 auto;display:flex;flex-wrap:wrap;gap:clamp(28px,3.5vw,52px);align-items:flex-start}
.ltr-left{flex:1 1 520px;min-width:min(100%,420px)}
.ltr-kicker{font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:#C79267;margin-bottom:16px}
.ltr-h2{font-family:var(--font-display),'Cormorant Garamond',serif;font-weight:500;font-size:clamp(34px,4.2vw,52px);line-height:1.1;margin:0 0 34px}
.ltr-gal{display:grid;gap:12px}
.ltr-gal img{width:100%;height:100%;object-fit:cover;display:block;cursor:zoom-in;background:#1A1A1D}
.ltr-main{height:clamp(280px,38vw,440px);overflow:hidden}
.ltr-thumbs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.ltr-thumbs>div{height:clamp(130px,14vw,168px);overflow:hidden}
.ltr-facts{display:flex;flex-wrap:wrap;gap:14px 40px;margin-top:34px;padding-top:30px;border-top:1px solid rgba(237,231,223,.12);font-size:15px;color:#B7AFA4}
.ltr-aside{flex:0 1 388px;min-width:min(100%,320px);position:sticky;top:24px}
.ltr-card{background:#141416;border:1px solid rgba(237,231,223,.12);border-radius:4px;padding:26px}
.ltr-price{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:22px}
.ltr-price b{font-family:var(--font-display),'Cormorant Garamond',serif;font-size:34px;font-weight:500}
.ltr-price span{font-size:14px;color:#8E8880}
.ltr-season{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#C79267}
.ltr-navmonth{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.ltr-navmonth div{font-size:14px;letter-spacing:.16em;text-transform:uppercase}
.ltr-nav{background:none;border:1px solid rgba(237,231,223,.18);color:#D5CEC4;width:32px;height:32px;border-radius:2px;cursor:pointer;font-size:15px;font-family:inherit}
.ltr-nav:hover{border-color:#C79267;color:#EDE7DF}
.ltr-dow,.ltr-week{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.ltr-dow div{height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#6F6A64}
.ltr-days{display:flex;flex-direction:column;gap:2px}
.ltr-d{height:40px;display:flex;align-items:center;justify-content:center;font-size:14px;border-radius:9px;color:#CFC7BC;cursor:pointer}
.ltr-d:hover{box-shadow:inset 0 0 0 1px rgba(237,231,223,.3)}
.ltr-d.off{background:#1B1517;color:#54524F;cursor:not-allowed;text-decoration:line-through;text-decoration-color:rgba(142,47,38,.8);box-shadow:none}
.ltr-d.sel{background:#8E2F26;color:#F6F1EA;font-weight:600}
.ltr-d.in{background:rgba(169,113,75,.3);color:#EDE7DF}
.ltr-d.pad{visibility:hidden}
.ltr-legend{display:flex;align-items:center;gap:8px;margin:14px 0 20px;font-size:12px;color:#7C766F}
.ltr-legend i{width:10px;height:10px;border-radius:2px;display:inline-block}
.ltr-row{border-top:1px solid rgba(237,231,223,.12);margin-top:18px;padding-top:18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.ltr-lab{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8E8880}
.ltr-round{background:none;border:1px solid rgba(237,231,223,.18);color:#D5CEC4;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px;font-family:inherit}
.ltr-round:hover{border-color:#C79267;color:#EDE7DF}
.ltr-lines{border-top:1px solid rgba(237,231,223,.12);margin-top:18px;padding-top:18px;display:flex;flex-direction:column;gap:11px;font-size:14.5px;color:#B7AFA4}
.ltr-lines div{display:flex;justify-content:space-between;gap:12px}
.ltr-lines b{color:#EDE7DF;font-weight:400}
.ltr-total{border-top:1px solid rgba(237,231,223,.12);margin-top:18px;padding-top:18px;display:flex;align-items:baseline;justify-content:space-between}
.ltr-total b{font-family:var(--font-display),'Cormorant Garamond',serif;font-size:30px;font-weight:500}
.ltr-cta{width:100%;margin-top:20px;border:none;background:#8E2F26;color:#F6F1EA;padding:16px;font-size:13.5px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;border-radius:2px;font-family:inherit;transition:background .24s}
.ltr-cta:hover{background:#A63A2F}
.ltr-note{text-align:center;margin-top:12px;font-size:12.5px;color:#7C766F}
.ltr-box{position:fixed;inset:0;z-index:90;background:rgba(8,8,9,.96);display:none;align-items:center;justify-content:center;padding:clamp(20px,5vw,64px);cursor:zoom-out}
.ltr-box.open{display:flex}
.ltr-box img{max-width:1100px;max-height:80vh;width:100%;object-fit:contain}
.ltr-arrow{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border:1px solid rgba(237,231,223,.25);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#EDE7DF;cursor:pointer}
@media(max-width:900px){.ltr-aside{position:static}}
`;

export function ReservationExact() {
  useEffect(() => {
    const MOIS = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ];
    const NIGHTLY = 195, CLEANING = 90, TAX = 2.3; // ← vos tarifs
    const BOOKED = (() => {
      const s: Record<string, 1> = {};
      const ranges = [
        ["2026-12-05", "2026-12-08"],
        ["2026-12-19", "2026-12-27"],
        ["2027-01-09", "2027-01-16"],
        ["2027-02-06", "2027-02-13"],
        ["2027-02-27", "2027-03-06"],
        ["2027-03-20", "2027-03-24"],
      ];
      ranges.forEach(([from, to]) => {
        let d = new Date(from);
        const e = new Date(to);
        while (d <= e) {
          s[d.toISOString().slice(0, 10)] = 1;
          d = new Date(d.getTime() + 864e5);
        }
      });
      return s;
    })();

    let cy = 2026, cm = 11, start: string | null = null, end: string | null = null, guests = 4;
    const $ = (id: string) => document.getElementById(id) as HTMLElement;
    const eur = (n: number) => n.toLocaleString("fr-FR") + " €";
    const fmt = (k: string) => {
      const p = k.split("-");
      return `${parseInt(p[2], 10)} ${MOIS[Number(p[1]) - 1].toLowerCase()}`;
    };
    const iso = (y: number, m: number, d: number) =>
      `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    function pick(k: string) {
      if (!start || end || k <= start) {
        start = k;
        end = null;
      } else {
        let d = new Date(start);
        const e = new Date(k);
        let ok = true;
        while (d <= e) {
          if (BOOKED[d.toISOString().slice(0, 10)]) ok = false;
          d = new Date(d.getTime() + 864e5);
        }
        if (ok) end = k;
        else {
          start = k;
          end = null;
        }
      }
      render();
    }

    function render() {
      $("ltr-month").textContent = MOIS[cm] + " " + cy;
      const off = (new Date(Date.UTC(cy, cm, 1)).getUTCDay() + 6) % 7;
      const dim = new Date(Date.UTC(cy, cm + 1, 0)).getUTCDate();
      const today = new Date().toISOString().slice(0, 10);
      const cells: { pad?: boolean; k?: string; d?: number; off?: boolean }[] = [];
      for (let i = 0; i < off; i++) cells.push({ pad: true });
      for (let d = 1; d <= dim; d++) {
        const k = iso(cy, cm, d);
        cells.push({ k, d, off: !!BOOKED[k] || k < today });
      }
      let html = "";
      for (let i = 0; i < cells.length; i += 7) {
        html += '<div class="ltr-week">';
        cells.slice(i, i + 7).forEach((c) => {
          if (c.pad) {
            html += '<div class="ltr-d pad"></div>';
            return;
          }
          const cls =
            "ltr-d" +
            (c.off
              ? " off"
              : c.k === start || c.k === end
                ? " sel"
                : start && end && c.k! > start && c.k! < end
                  ? " in"
                  : "");
          html += `<div class="${cls}" data-k="${c.k}">${c.d}</div>`;
        });
        html += "</div>";
      }
      $("ltr-days").innerHTML = html;
      $("ltr-guests").textContent = guests + (guests > 1 ? " voyageurs" : " voyageur");

      const nights = start && end ? Math.round((new Date(end).getTime() - new Date(start).getTime()) / 864e5) : 0;
      $("ltr-dates").textContent = start && end ? `${fmt(start)} → ${fmt(end)}` : start ? "Départ le ?" : "Choisissez vos dates";
      $("ltr-nights").textContent = nights ? nights + (nights > 1 ? " nuits" : " nuit") : "—";
      const stay = nights * NIGHTLY;
      const taxe = Math.round(nights * guests * TAX);
      ([
        ["ltr-l1", eur(NIGHTLY) + " × " + nights + (nights > 1 ? " nuits" : " nuit"), eur(stay)],
        ["ltr-l2", null, eur(CLEANING)],
        ["ltr-l3", null, eur(taxe)],
      ] as [string, string | null, string][]).forEach(([id, label, value]) => {
        const el = $(id);
        el.hidden = !nights;
        if (label) el.querySelector("span")!.textContent = label;
        el.querySelector("b")!.textContent = value;
      });
      $("ltr-total").textContent = nights ? eur(stay + CLEANING + taxe) : "—";
    }

    function onDaysClick(e: MouseEvent) {
      const t = (e.target as HTMLElement).closest(".ltr-d") as HTMLElement | null;
      if (!t || t.classList.contains("off") || t.classList.contains("pad")) return;
      pick(t.dataset.k!);
    }
    function onPrev() {
      cm--;
      if (cm < 0) {
        cm = 11;
        cy--;
      }
      render();
    }
    function onNext() {
      cm++;
      if (cm > 11) {
        cm = 0;
        cy++;
      }
      render();
    }
    function onPlus() {
      guests = Math.min(6, guests + 1);
      render();
    }
    function onMinus() {
      guests = Math.max(1, guests - 1);
      render();
    }

    $("ltr-days").addEventListener("click", onDaysClick);
    $("ltr-prev").addEventListener("click", onPrev);
    $("ltr-next").addEventListener("click", onNext);
    $("ltr-plus").addEventListener("click", onPlus);
    $("ltr-minus").addEventListener("click", onMinus);
    $("ltr-nightly").textContent = eur(NIGHTLY);

    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".ltr-gal img"));
    let cur = 0;
    const box = $("ltr-box");
    function show(n: number) {
      cur = (n + imgs.length) % imgs.length;
      ($("ltr-boximg") as HTMLImageElement).src = imgs[cur].src;
      box.classList.add("open");
    }
    const imgHandlers = imgs.map((im, i) => {
      const handler = () => show(i);
      im.addEventListener("click", handler);
      return handler;
    });
    function onBoxClick() {
      box.classList.remove("open");
    }
    function onPv(e: MouseEvent) {
      e.stopPropagation();
      show(cur - 1);
    }
    function onNx(e: MouseEvent) {
      e.stopPropagation();
      show(cur + 1);
    }
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") box.classList.remove("open");
    }

    box.addEventListener("click", onBoxClick);
    $("ltr-pv").addEventListener("click", onPv as EventListener);
    $("ltr-nx").addEventListener("click", onNx as EventListener);
    document.addEventListener("keydown", onKeydown);

    render();

    return () => {
      $("ltr-days")?.removeEventListener("click", onDaysClick);
      $("ltr-prev")?.removeEventListener("click", onPrev);
      $("ltr-next")?.removeEventListener("click", onNext);
      $("ltr-plus")?.removeEventListener("click", onPlus);
      $("ltr-minus")?.removeEventListener("click", onMinus);
      imgs.forEach((im, i) => im.removeEventListener("click", imgHandlers[i]));
      box?.removeEventListener("click", onBoxClick);
      $("ltr-pv")?.removeEventListener("click", onPv as EventListener);
      $("ltr-nx")?.removeEventListener("click", onNx as EventListener);
      document.removeEventListener("keydown", onKeydown);
    };
  }, []);

  return (
    <section className="ltr-sec" id="disponibilites">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ltr-wrap">
        <div className="ltr-left">
          <div className="ltr-kicker">L&apos;appartement</div>
          <h2 className="ltr-h2">72 m² de bois et de lumière</h2>
          <div className="ltr-gal">
            <div className="ltr-main">
              <img data-i="0" src="/images/apartment/salon-1.jpeg" alt="Séjour" />
            </div>
            <div className="ltr-thumbs">
              <div>
                <img data-i="1" src="/images/apartment/cuisine-1.jpeg" alt="Cuisine" />
              </div>
              <div>
                <img data-i="2" src="/images/apartment/chambre-1-1.jpeg" alt="Chambre" />
              </div>
              <div>
                <img data-i="3" src="/images/apartment/salle-de-bain-1-1.jpeg" alt="Salle de bain" />
              </div>
              <div>
                <img data-i="4" src="/images/apartment/terrasse-1.jpeg" alt="Terrasse" />
              </div>
            </div>
          </div>
          <div className="ltr-facts">
            <span>3 chambres</span>
            <span>6 couchages</span>
            <span>2 salles d&apos;eau</span>
            <span>Cheminée</span>
            <span>Terrasse 18 m² plein sud</span>
            <span>Casier à skis chauffé</span>
          </div>
        </div>

        <aside className="ltr-aside">
          <div className="ltr-card">
            <div className="ltr-price">
              <div>
                <b id="ltr-nightly">195 €</b>
                <span> / nuit</span>
              </div>
              <div className="ltr-season">Saison d&apos;hiver</div>
            </div>
            <div className="ltr-navmonth">
              <button className="ltr-nav" id="ltr-prev" aria-label="Mois précédent" type="button">
                ‹
              </button>
              <div id="ltr-month">Décembre 2026</div>
              <button className="ltr-nav" id="ltr-next" aria-label="Mois suivant" type="button">
                ›
              </button>
            </div>
            <div className="ltr-dow">
              <div>L</div>
              <div>M</div>
              <div>M</div>
              <div>J</div>
              <div>V</div>
              <div>S</div>
              <div>D</div>
            </div>
            <div className="ltr-days" id="ltr-days" />
            <div className="ltr-legend">
              <i style={{ background: "rgba(169,113,75,.35)" }} /> Sélection{" "}
              <i style={{ background: "#2A2022", marginLeft: 10 }} /> Indisponible
            </div>
            <div className="ltr-row">
              <div>
                <div className="ltr-lab">Voyageurs</div>
                <div id="ltr-guests" style={{ fontSize: 16, marginTop: 3 }}>
                  4 voyageurs
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="ltr-round" id="ltr-minus" type="button">
                  –
                </button>
                <button className="ltr-round" id="ltr-plus" type="button">
                  +
                </button>
              </div>
            </div>
            <div className="ltr-lines">
              <div>
                <span id="ltr-dates">Choisissez vos dates</span>
                <b id="ltr-nights">—</b>
              </div>
              <div id="ltr-l1" hidden>
                <span></span>
                <b></b>
              </div>
              <div id="ltr-l2" hidden>
                <span>Ménage de fin de séjour</span>
                <b></b>
              </div>
              <div id="ltr-l3" hidden>
                <span>Taxe de séjour</span>
                <b></b>
              </div>
            </div>
            <div className="ltr-total">
              <span className="ltr-lab">Total</span>
              <b id="ltr-total">—</b>
            </div>
            <button className="ltr-cta" type="button">
              Demander ces dates
            </button>
            <div className="ltr-note">Réponse sous 24 h · Aucun frais de dossier</div>
          </div>
        </aside>
      </div>

      <div className="ltr-box" id="ltr-box">
        <div className="ltr-arrow" id="ltr-pv" style={{ left: 22 }}>
          ‹
        </div>
        <img id="ltr-boximg" alt="" />
        <div className="ltr-arrow" id="ltr-nx" style={{ right: 22 }}>
          ›
        </div>
      </div>
    </section>
  );
}
