// Gabarits d'emails transactionnels — HTML simple avec styles en ligne
// (les clients mail ignorent souvent les balises <style>), sans dépendance
// externe. Le formatage des dates/montants reste volontairement simple
// (Intl), pas de logique de prix dupliquée : le détail vient toujours de
// calculateGrandTotal (lib/pricing.ts), jamais recalculé ici.

function formatDateFr(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function wrapper(bodyHtml: string): string {
  return `
    <div style="background:#0b0b0c;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#ede7df;">
      <div style="max-width:520px;margin:0 auto;background:#141416;border:1px solid rgba(237,231,223,0.1);padding:32px;">
        <p style="margin:0 0 24px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c79267;">
          Les Terrasses de Risoul
        </p>
        ${bodyHtml}
      </div>
    </div>
  `;
}

export function bookingRequestReceivedEmail(params: {
  firstName: string;
  startDate: string;
  endDate: string;
}): { subject: string; html: string } {
  const { firstName, startDate, endDate } = params;
  return {
    subject: "Votre demande de réservation — Les Terrasses de Risoul",
    html: wrapper(`
      <p style="margin:0 0 16px;font-size:20px;">Bonjour ${firstName},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c8c1b7;">
        Nous avons bien reçu votre demande de réservation du
        <strong style="color:#ede7df;">${formatDateFr(startDate)}</strong>
        au <strong style="color:#ede7df;">${formatDateFr(endDate)}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c8c1b7;">
        Nous revenons vers vous rapidement pour la confirmer.
      </p>
      <p style="margin:24px 0 0;font-size:13px;color:#8e8880;">
        Réponse rapide · Aucun frais de dossier
      </p>
    `),
  };
}

export function bookingConfirmedEmail(params: {
  firstName: string;
  startDate: string;
  endDate: string;
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  touristTax: number;
  grandTotal: number;
  checkinTime?: string;
  checkoutTime?: string;
  contactEmail?: string;
}): { subject: string; html: string } {
  const {
    firstName,
    startDate,
    endDate,
    nights,
    pricePerNight,
    cleaningFee,
    touristTax,
    grandTotal,
    checkinTime,
    checkoutTime,
    contactEmail,
  } = params;

  const eur = (amount: number) => `${Math.round(amount).toLocaleString("fr-FR")} €`;

  const lineRow = (label: string, amount: number) => `
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#9e978e;">${label}</td>
      <td style="padding:4px 0;font-size:14px;color:#ede7df;text-align:right;">${eur(amount)}</td>
    </tr>
  `;

  return {
    subject: "Votre réservation est confirmée — Les Terrasses de Risoul",
    html: wrapper(`
      <p style="margin:0 0 16px;font-size:20px;">Bonjour ${firstName},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c8c1b7;">
        Votre séjour du <strong style="color:#ede7df;">${formatDateFr(startDate)}</strong>
        au <strong style="color:#ede7df;">${formatDateFr(endDate)}</strong> est confirmé.
      </p>
      ${
        checkinTime || checkoutTime
          ? `<p style="margin:0 0 16px;font-size:13px;color:#8e8880;">
              ${checkinTime ? `Arrivée à partir de ${checkinTime}` : ""}
              ${checkinTime && checkoutTime ? " · " : ""}
              ${checkoutTime ? `Départ avant ${checkoutTime}` : ""}
            </p>`
          : ""
      }
      <table style="width:100%;border-collapse:collapse;margin-top:16px;border-top:1px solid rgba(237,231,223,0.1);padding-top:8px;">
        ${lineRow(`${eur(pricePerNight)} × ${nights} nuit${nights > 1 ? "s" : ""}`, pricePerNight * nights)}
        ${cleaningFee > 0 ? lineRow("Ménage", cleaningFee) : ""}
        ${touristTax > 0 ? lineRow("Taxe de séjour", touristTax) : ""}
        <tr>
          <td style="padding:12px 0 0;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#8e8880;border-top:1px solid rgba(237,231,223,0.1);">Total</td>
          <td style="padding:12px 0 0;font-size:20px;color:#ede7df;text-align:right;border-top:1px solid rgba(237,231,223,0.1);">${eur(grandTotal)}</td>
        </tr>
      </table>
      <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#c8c1b7;">
        Nous revenons vers vous prochainement au sujet du contrat de location
        et de l&apos;acompte.
      </p>
      ${
        contactEmail
          ? `<p style="margin:16px 0 0;font-size:13px;color:#8e8880;">
              Une question ? Écrivez-nous à ${contactEmail}.
            </p>`
          : ""
      }
    `),
  };
}
