"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type Mode = "signin" | "forgot";
type Status = "idle" | "loading" | "error" | "sent";

const inputClass =
  "w-full border border-foreground/15 bg-background px-3.5 py-2.5 text-foreground placeholder:text-mist-700 focus:border-wood-500 focus:outline-none";

export default function AdminLoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage("Email ou mot de passe incorrect.");
      return;
    }

    window.location.href = "/admin";
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
    });

    if (error) {
      setStatus("error");
      setErrorMessage("Une erreur est survenue, réessayez.");
      return;
    }

    setStatus("sent");
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setErrorMessage("");
  }

  return (
    <main className="flex flex-1 items-center justify-center py-16">
      <Container>
        <div className="mx-auto max-w-sm">
          <h1 className="font-display text-3xl text-foreground">
            Connexion admin
          </h1>

          {mode === "signin" ? (
            <>
              <p className="mt-2 text-sm text-mist-500">
                Accès réservé à la gestion des Terrasses de Risoul.
              </p>
              <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-mist-400">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="votre@email.fr"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 flex items-center justify-between text-sm text-mist-400">
                    Mot de passe
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-xs text-mist-600 underline-offset-2 hover:text-foreground hover:underline"
                    >
                      {showPassword ? "Masquer" : "Afficher"}
                    </button>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClass}
                  />
                </label>

                {status === "error" && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}

                <Button type="submit" disabled={status === "loading"} className="w-full">
                  {status === "loading" ? "Connexion…" : "Se connecter"}
                </Button>

                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="block w-full text-center text-sm text-mist-500 underline-offset-2 hover:text-foreground hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-mist-500">
                Recevez un lien par email pour choisir un nouveau mot de
                passe.
              </p>

              {status === "sent" ? (
                <p className="mt-6 border border-foreground/10 bg-anthracite-800 p-4 text-sm text-wood-300">
                  Un lien de réinitialisation a été envoyé à {email}.
                  Vérifiez votre boîte mail.
                </p>
              ) : (
                <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm text-mist-400">Email</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="votre@email.fr"
                      className={inputClass}
                    />
                  </label>

                  {status === "error" && (
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  )}

                  <Button type="submit" disabled={status === "loading"} className="w-full">
                    {status === "loading" ? "Envoi…" : "Envoyer le lien"}
                  </Button>
                </form>
              )}

              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="mt-4 block w-full text-center text-sm text-mist-500 underline-offset-2 hover:text-foreground hover:underline"
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
