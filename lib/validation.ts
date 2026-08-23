// Règles de validation partagées entre le formulaire (retour immédiat) et
// l'action serveur (dernier rempart, le client ne fait jamais foi).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Numéros français : 0X XX XX XX XX ou +33 X XX XX XX XX, espaces/points/
// tirets tolérés à la saisie.
const PHONE_RE = /^(0[1-9]\d{8}|\+33[1-9]\d{8})$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/[\s.-]/g, "");
  return PHONE_RE.test(digitsOnly);
}
