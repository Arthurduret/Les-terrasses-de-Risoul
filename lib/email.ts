import { Resend } from "resend";

// onboarding@resend.dev en repli si RESEND_FROM_EMAIL n'est pas défini
// (n'envoie qu'à l'adresse du compte Resend — utile en local sans domaine
// vérifié). lesterrassesderisoul.fr est vérifié dans Resend, voir
// .env.local.example.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Les Terrasses de Risoul <onboarding@resend.dev>";

// Un email raté (clé absente, Resend indisponible, domaine non
// vérifié...) ne doit jamais faire échouer la réservation elle-même —
// on log l'erreur côté serveur et on continue.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY absente — email non envoyé :", subject);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("Erreur d'envoi email Resend :", error.message);
    }
  } catch (err) {
    console.error(
      "Erreur d'envoi email :",
      err instanceof Error ? err.message : err
    );
  }
}
