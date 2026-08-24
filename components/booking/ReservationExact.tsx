"use client";

import { useMemo, useState } from "react";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { BookingRequestModal } from "./BookingRequestModal";
import {
  addMonths,
  firstBlockedAfter,
  formatISO,
  formatMonthLabel,
  formatShortDate,
  getMonthMatrix,
  isSameDay,
  isSaturday,
  rangeHasBlockedDay,
  startOfDay,
  startOfMonth,
  WEEKDAY_LABELS,
} from "@/components/calendar/utils";
import {
  calculateGrandTotal,
  getUpcomingRule,
  type GrandTotal,
  type WeekAssignments,
} from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];

const MAX_GUESTS = 12;

// Style repris tel quel du fichier reservation.html fourni par
// l'utilisateur (mêmes classes .ltr-*, mêmes couleurs/tailles/espacements).
// Seuls ajouts : .ltr-d.mid (jours hors samedi, non sélectionnables — notre
// calendrier impose des séjours samedi-samedi, un état que le fichier
// d'origine n'avait pas besoin de représenter) et les états :disabled des
// boutons (ronds voyageurs, CTA), absents du fichier source.
const STYLE = `
.ltr-sec *{box-sizing:border-box}
.ltr-sec{background:#0B0B0C;color:#EDE7DF;font-family:var(--font-geist-sans),'Barlow',sans-serif;font-weight:300;padding:clamp(64px,9vw,120px) clamp(20px,5vw,72px)}
.ltr-wrap{max-width:1320px;margin:0 auto;display:flex;flex-wrap:wrap;gap:clamp(28px,3.5vw,52px);align-items:flex-start}
.ltr-left{flex:1 1 520px;min-width:min(100%,420px)}
.ltr-kicker{font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:#C79267;margin-bottom:16px}
.ltr-h2{font-family:var(--font-display),'Cormorant Garamond',serif;font-weight:500;font-size:clamp(34px,4.2vw,52px);line-height:1.1;margin:0 0 34px}
.ltr-facts{display:flex;flex-wrap:nowrap;justify-content:space-between;align-items:center;gap:12px;margin-top:34px;padding-top:30px;border-top:1px solid rgba(237,231,223,.12);font-size:15px;color:#B7AFA4;white-space:nowrap}
.ltr-desc{margin-top:34px;padding-top:30px;border-top:1px solid rgba(237,231,223,.12)}
.ltr-desc h3{font-family:var(--font-display),'Cormorant Garamond',serif;font-weight:500;font-size:22px;margin:0 0 14px;color:#EDE7DF}
.ltr-desc p{font-size:15px;line-height:1.75;color:#B7AFA4;margin:0}
.ltr-desc p+p,.ltr-desc ul+p{margin-top:14px}
.ltr-desc ul{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:12px}
.ltr-desc li{position:relative;padding-left:18px;font-size:15px;line-height:1.75;color:#B7AFA4}
.ltr-desc li::before{content:"";position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:#C79267}
.ltr-desc li b{color:#EDE7DF;font-weight:500}
.ltr-aside{flex:0 1 388px;min-width:min(100%,320px);position:sticky;top:24px}
.ltr-card{background:#141416;border:1px solid rgba(237,231,223,.12);border-radius:4px;padding:26px}
.ltr-price{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:22px;min-height:38px}
.ltr-price b{font-family:var(--font-display),'Cormorant Garamond',serif;font-size:34px;font-weight:500}
.ltr-price span{font-size:14px;color:#8E8880}
.ltr-season{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#C79267}
.ltr-navmonth{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.ltr-navmonth div{font-size:14px;letter-spacing:.16em;text-transform:uppercase}
.ltr-nav{background:none;border:1px solid rgba(237,231,223,.18);color:#D5CEC4;width:32px;height:32px;border-radius:2px;cursor:pointer;font-size:15px;font-family:inherit}
.ltr-nav:hover{border-color:#C79267;color:#EDE7DF}
.ltr-nav:disabled{opacity:.3;cursor:not-allowed}
.ltr-nav:disabled:hover{border-color:rgba(237,231,223,.18);color:#D5CEC4}
.ltr-dow,.ltr-week{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.ltr-dow div{height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#6F6A64}
.ltr-days{display:flex;flex-direction:column;gap:2px}
.ltr-d{height:40px;display:flex;align-items:center;justify-content:center;font-size:14px;border-radius:9px;color:#CFC7BC;cursor:pointer;border:none;background:none;font-family:inherit}
.ltr-d:hover{box-shadow:inset 0 0 0 1px rgba(237,231,223,.3)}
.ltr-d.off{background:#1B1517;color:#54524F;cursor:not-allowed;text-decoration:line-through;text-decoration-color:rgba(142,47,38,.8);box-shadow:none}
.ltr-d.mid{color:#54524F;cursor:not-allowed}
.ltr-d.sel{background:#8E2F26;color:#F6F1EA;font-weight:600}
.ltr-d.in{background:rgba(169,113,75,.3);color:#EDE7DF}
.ltr-d.pad{visibility:hidden;cursor:default}
.ltr-legend{display:flex;align-items:center;gap:8px;margin:14px 0 20px;font-size:12px;color:#7C766F}
.ltr-legend i{width:10px;height:10px;border-radius:2px;display:inline-block}
.ltr-row{border-top:1px solid rgba(237,231,223,.12);margin-top:18px;padding-top:18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.ltr-lab{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8E8880}
.ltr-round{background:none;border:1px solid rgba(237,231,223,.18);color:#D5CEC4;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px;font-family:inherit}
.ltr-round:hover{border-color:#C79267;color:#EDE7DF}
.ltr-round:disabled{opacity:.3;cursor:not-allowed;border-color:rgba(237,231,223,.1)}
.ltr-round:disabled:hover{border-color:rgba(237,231,223,.1);color:#D5CEC4}
.ltr-lines{border-top:1px solid rgba(237,231,223,.12);margin-top:18px;padding-top:18px;display:flex;flex-direction:column;gap:11px;font-size:14.5px;color:#B7AFA4}
.ltr-lines div{display:flex;justify-content:space-between;gap:12px}
.ltr-lines b{color:#EDE7DF;font-weight:400}
.ltr-total{border-top:1px solid rgba(237,231,223,.12);margin-top:18px;padding-top:18px;display:flex;align-items:baseline;justify-content:space-between}
.ltr-total b{font-family:var(--font-display),'Cormorant Garamond',serif;font-size:30px;font-weight:500}
.ltr-cta{width:100%;margin-top:20px;border:none;background:#8E2F26;color:#F6F1EA;padding:16px;font-size:13.5px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;border-radius:2px;font-family:inherit;transition:background .24s}
.ltr-cta:hover{background:#A63A2F}
.ltr-cta:disabled{opacity:.4;cursor:not-allowed}
.ltr-cta:disabled:hover{background:#8E2F26}
.ltr-note{text-align:center;margin-top:12px;font-size:12.5px;color:#7C766F}
@media(max-width:900px){.ltr-aside{position:static}}
`;

function eur(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} €`;
}

interface ReservationExactProps {
  blockedDates: string[];
  pricingRules: PricingRule[];
  weekAssignments: WeekAssignments;
  settings: Record<string, string>;
}

export function ReservationExact({
  blockedDates,
  pricingRules,
  weekAssignments,
  settings,
}: ReservationExactProps) {
  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const firstMonth = useMemo(() => startOfMonth(today), [today]);
  const todayISO = useMemo(() => formatISO(today), [today]);

  const [visibleMonth, setVisibleMonth] = useState(firstMonth);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cleaningRequested, setCleaningRequested] = useState(true);
  const [requestOpen, setRequestOpen] = useState(false);

  const cleaningFeeSetting = Number(settings.cleaning_fee ?? 0) || 0;

  const canGoPrev = visibleMonth.getTime() > firstMonth.getTime();

  const previewEnd = useMemo(() => {
    if (!selectionStart || selectionEnd || !hoverDate) return null;
    if (!isSaturday(hoverDate)) return null;
    if (hoverDate.getTime() <= selectionStart.getTime()) return null;
    const nextBlocked = firstBlockedAfter(selectionStart, blockedSet);
    if (nextBlocked && nextBlocked.getTime() <= hoverDate.getTime()) return null;
    return hoverDate;
  }, [selectionStart, selectionEnd, hoverDate, blockedSet]);

  const rangeEnd = selectionEnd ?? previewEnd;

  function isDayUnavailable(date: Date) {
    return date.getTime() < today.getTime() || blockedSet.has(formatISO(date));
  }

  // Séjours à la semaine, du samedi au samedi uniquement : seul un samedi
  // peut devenir arrivée ou départ.
  function handleDayClick(date: Date) {
    if (isDayUnavailable(date) || !isSaturday(date)) return;

    if (!selectionStart || selectionEnd) {
      setSelectionStart(date);
      setSelectionEnd(null);
      return;
    }
    if (date.getTime() <= selectionStart.getTime()) {
      setSelectionStart(date);
      return;
    }
    if (rangeHasBlockedDay(selectionStart, date, blockedSet)) {
      setSelectionStart(date);
      setSelectionEnd(null);
      return;
    }
    setSelectionEnd(date);
  }

  let grandTotal: GrandTotal | null = null;
  let priceError: string | null = null;
  if (selectionStart && selectionEnd) {
    try {
      grandTotal = calculateGrandTotal(selectionStart, selectionEnd, pricingRules, weekAssignments, {
        adults,
        cleaningRequested,
        cleaningFee: cleaningFeeSetting,
        touristTaxPerPersonPerNight: Number(settings.tourist_tax_per_person_per_night ?? 0) || 0,
      });
    } catch (err) {
      priceError = err instanceof Error ? err.message : "Tarif indisponible pour ces dates.";
    }
  }

  const headerRule = grandTotal
    ? { label: grandTotal.breakdown.ruleLabel, pricePerNight: grandTotal.breakdown.pricePerNight }
    : (() => {
        const rule = getUpcomingRule(pricingRules, weekAssignments, todayISO);
        return rule ? { label: rule.label, pricePerNight: rule.price_per_night } : null;
      })();

  const nights = grandTotal?.breakdown.nights ?? 0;
  const weeks = nights ? Math.round(nights / 7) : 0;

  const monthWeeks = getMonthMatrix(visibleMonth);

  return (
    <section className="ltr-sec" id="disponibilites">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ltr-wrap">
        <div className="ltr-left">
          <p className="ltr-kicker">L&apos;appartement</p>
          <h2 className="ltr-h2">63 m² de bois et de lumière</h2>
          <PhotoGallery />
          <div className="ltr-facts">
            <span>2 chambres</span>
            <span>Coin montagne</span>
            <span>Dortoir</span>
            <span>2 salles de bain</span>
            <span>Terrasse 8 m² plein ouest</span>
            <span>Casier à ski</span>
          </div>

          <div className="ltr-desc">
            <h3>L&apos;appartement en quelques mots</h3>
            <p>
              Nous louons notre appartement dans une nouvelle résidence sur la
              station de Risoul 1850, situé juste derrière l&apos;Office du Tourisme, à
              proximité des pistes (150m du TK de Pelinche &amp; 200m du Front de
              Neige pour tous les départs des TS).
            </p>
            <p>
              Cet appartement de type triplex est flambant neuf, dans résidence
              toute neuve depuis décembre 2024.
            </p>
            <p>
              Il est entièrement équipé et contient 10/12 couchages pour convenir
              parfaitement à 2/3 familles avec enfants.
            </p>
            <p>Voici la répartition de l&apos;appartement :</p>
            <ul>
              <li>
                <b>1er étage</b> : 1 buanderie avec WC et équipé d&apos;une penderie à
                chaussures de ski pour garder au chaud, 1 salle de bain, 1 cuisine
                entièrement équipée (combi frigo/congélo, four &amp; plaques
                induction, lave-vaisselle, robot de cuisine, machine à café moulu,
                appareil à fondue &amp; raclette) ouverte sur salon avec canapé
                d&apos;angle et TV, 1 balcon de 8m² avec table extérieure et vue sur
                la vallée.
              </li>
              <li>
                <b>2ème étage</b> : 2 chambres avec chacune 1 lit double, 1 coin
                montagne avec 1 clic-clac convertible en 1 lit double &amp; TV, 1
                salle de bain avec WC. (1 second balcon est présent mais pas
                encore fonctionnel et donc pas accessible).
              </li>
              <li>
                <b>3ème étage</b> : Mezzanine de 15m² équipé de 2 lits doubles
                superposés (soit 4 lits doubles) pour dortoir enfants ou
                adolescents, et nombreux rangements pour poser ses affaires.
              </li>
            </ul>
            <p>
              Sur le palier de l&apos;appartement (même étage), accès à un casier à
              ski &amp; accès direct à l&apos;extérieur pour rejoindre le front de
              neige.
            </p>
          </div>
        </div>

        <aside className="ltr-aside">
          <div className="ltr-card">
            <div className="ltr-price">
              {headerRule ? (
                <>
                  <div>
                    <b>{eur(headerRule.pricePerNight * 7)}</b>
                    <span> / semaine</span>
                  </div>
                  <div className="ltr-season">{headerRule.label}</div>
                </>
              ) : (
                <span style={{ fontSize: 14, color: "#8E8880" }}>
                  Choisissez vos dates pour voir le tarif
                </span>
              )}
            </div>

            <div className="ltr-navmonth">
              <button
                type="button"
                className="ltr-nav"
                aria-label="Mois précédent"
                disabled={!canGoPrev}
                onClick={() => canGoPrev && setVisibleMonth((m) => addMonths(m, -1))}
              >
                ‹
              </button>
              <div>{formatMonthLabel(visibleMonth)}</div>
              <button
                type="button"
                className="ltr-nav"
                aria-label="Mois suivant"
                onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
              >
                ›
              </button>
            </div>

            <div className="ltr-dow">
              {WEEKDAY_LABELS.map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>

            <div className="ltr-days" onMouseLeave={() => setHoverDate(null)}>
              {monthWeeks.map((week, weekIndex) => (
                <div className="ltr-week" key={weekIndex}>
                  {week.map((date, dayIndex) => {
                    if (!date) {
                      return <div key={`${weekIndex}-${dayIndex}`} className="ltr-d pad" />;
                    }
                    const unavailable = isDayUnavailable(date);
                    const isCap =
                      (selectionStart && isSameDay(date, selectionStart)) ||
                      (rangeEnd ? isSameDay(date, rangeEnd) : false);
                    const inRange =
                      selectionStart && rangeEnd
                        ? date.getTime() > selectionStart.getTime() && date.getTime() < rangeEnd.getTime()
                        : false;
                    const notSelectable = !unavailable && !isSaturday(date);
                    const cls =
                      "ltr-d" +
                      (unavailable
                        ? " off"
                        : isCap
                          ? " sel"
                          : inRange
                            ? " in"
                            : notSelectable
                              ? " mid"
                              : "");
                    return (
                      <button
                        type="button"
                        key={formatISO(date)}
                        className={cls}
                        disabled={unavailable || notSelectable}
                        onClick={() => handleDayClick(date)}
                        onMouseEnter={() => setHoverDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="ltr-legend">
              <i style={{ background: "rgba(169,113,75,.35)" }} /> Sélection{" "}
              <i style={{ background: "#2A2022", marginLeft: 10 }} /> Indisponible
            </div>

            <div className="ltr-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div className="ltr-lab">Adultes</div>
                  <div style={{ fontSize: 16, marginTop: 3 }}>
                    {adults} adulte{adults > 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="ltr-round"
                    aria-label="Retirer un adulte"
                    disabled={adults <= 1}
                    onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  >
                    –
                  </button>
                  <button
                    type="button"
                    className="ltr-round"
                    aria-label="Ajouter un adulte"
                    disabled={adults + children >= MAX_GUESTS}
                    onClick={() => setAdults((a) => Math.min(MAX_GUESTS - children, a + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div className="ltr-lab">Enfants</div>
                  <div style={{ fontSize: 16, marginTop: 3 }}>
                    {children} enfant{children > 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="ltr-round"
                    aria-label="Retirer un enfant"
                    disabled={children <= 0}
                    onClick={() => setChildren((c) => Math.max(0, c - 1))}
                  >
                    –
                  </button>
                  <button
                    type="button"
                    className="ltr-round"
                    aria-label="Ajouter un enfant"
                    disabled={adults + children >= MAX_GUESTS}
                    onClick={() => setChildren((c) => Math.min(MAX_GUESTS - adults, c + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="ltr-lines">
              <div>
                <span>
                  {selectionStart && selectionEnd
                    ? `${formatShortDate(selectionStart)} → ${formatShortDate(selectionEnd)}`
                    : selectionStart
                      ? "Choisissez la date de départ"
                      : "Séjours du samedi au samedi"}
                </span>
                <b>{nights ? `${nights} nuit${nights > 1 ? "s" : ""}` : "—"}</b>
              </div>
              {grandTotal && cleaningFeeSetting > 0 && (
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={cleaningRequested}
                      onChange={(e) => setCleaningRequested(e.target.checked)}
                      style={{ width: 14, height: 14, accentColor: "#C79267" }}
                    />
                    <span>Ménage de fin de séjour</span>
                  </label>
                  <b>{cleaningRequested ? eur(cleaningFeeSetting) : "—"}</b>
                </div>
              )}
              {grandTotal && grandTotal.touristTax > 0 && (
                <div>
                  <span>Taxe de séjour</span>
                  <b>{eur(grandTotal.touristTax)}</b>
                </div>
              )}
              {priceError && !grandTotal && (
                <div>
                  <span>{priceError}</span>
                  <b></b>
                </div>
              )}
              {grandTotal && (
                <div>
                  <span>
                    {eur(grandTotal.breakdown.pricePerNight * 7)} / semaine × {weeks} semaine
                    {weeks > 1 ? "s" : ""}
                  </span>
                  <b>{eur(grandTotal.breakdown.total)}</b>
                </div>
              )}
            </div>

            <div className="ltr-total">
              <span className="ltr-lab">Total</span>
              <b>{grandTotal ? eur(grandTotal.grandTotal) : "—"}</b>
            </div>

            <button
              type="button"
              className="ltr-cta"
              disabled={!selectionStart || !selectionEnd}
              onClick={() => setRequestOpen(true)}
            >
              Demander ces dates
            </button>
            <div className="ltr-note">Réponse rapide · Aucun frais de dossier</div>
          </div>
        </aside>
      </div>

      <BookingRequestModal
        startDate={requestOpen ? selectionStart : null}
        endDate={requestOpen ? selectionEnd : null}
        pricingRules={pricingRules}
        weekAssignments={weekAssignments}
        settings={settings}
        defaultAdults={adults}
        defaultChildren={children}
        defaultCleaningRequested={cleaningRequested}
        onClose={() => setRequestOpen(false)}
      />
    </section>
  );
}
