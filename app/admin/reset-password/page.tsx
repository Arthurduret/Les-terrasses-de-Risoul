"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type Status = "checking" | "ready" | "invalid" | "loading" | "error" | "done";

const inputClass =
  "w-full border border-foreground/15 bg-background px-3.5 py-2.5 text-foreground placeholder:text-mist-700 focus:border-wood-500 focus:outline-none";

// Atteinte uniquement via le lien "mot de passe oublié" (après échange du
// code de récupération dans /auth/callback, qui établit une session
// temporaire) — d'où la vérification de session au chargement plutôt que
// de supposer que la page n'est visitée que dans ce contexte.
export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setStatus(user ? "ready" : "invalid");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      const tooShort = /password.*(character|least)/i.test(error.message);
      setErrorMessage(
        tooShort
          ? "Le mot de passe doit contenir au moins 6 caractères."
          : "Une erreur est survenue, réessayez."
      );
      return;
    }

    setStatus("done");
  }

  return (
    <main className="flex flex-1 items-center justify-center py-16">
      <Container>
        <div className="mx-auto max-w-sm">
          <h1 className="font-display text-3xl text-foreground">
            Nouveau mot de passe
          </h1>

          {status === "checking" && (
            <p className="mt-6 text-sm text-mist-500">Vérification du lien…</p>
          )}

          {status === "invalid" && (
            <>
              <p className="mt-6 border border-foreground/10 bg-anthracite-800 p-4 text-sm text-mist-400">
                Ce lien n&apos;est plus valide — il a peut-être déjà été
                utilisé ou a expiré.
              </p>
              <a
                href="/admin/login"
                className="mt-4 block text-center text-sm text-mist-500 underline-offset-2 hover:text-foreground hover:underline"
              >
                Redemander un lien
              </a>
            </>
          )}

          {status === "done" && (
            <>
              <p className="mt-6 border border-foreground/10 bg-anthracite-800 p-4 text-sm text-wood-300">
                Mot de passe mis à jour.
              </p>
              <a href="/admin">
                <Button className="mt-4 w-full">Accéder à la console</Button>
              </a>
            </>
          )}

          {(status === "ready" || status === "loading" || status === "error") && (
            <>
              <p className="mt-2 text-sm text-mist-500">
                Choisissez un nouveau mot de passe pour votre compte admin.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">
                    Nouveau mot de passe
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">
                    Confirmer le mot de passe
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={inputClass}
                  />
                </label>

                {status === "error" && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}

                <Button type="submit" disabled={status === "loading"} className="w-full">
                  {status === "loading" ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </form>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
