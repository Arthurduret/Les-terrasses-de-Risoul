"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <main className="flex flex-1 items-center justify-center py-16">
      <Container>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-bold text-stone-900">
            Connexion admin
          </h1>
          <p className="mt-2 text-stone-600">
            Recevez un lien de connexion par email — pas de mot de passe à
            retenir.
          </p>

          {status === "sent" ? (
            <p className="mt-6 rounded-lg bg-pine-50 p-4 text-pine-800">
              Un lien de connexion a été envoyé à {email}. Vérifiez votre
              boîte mail.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="votre@email.fr"
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-pine-600 focus:outline-none"
              />
              <Button type="submit" className="w-full">
                Recevoir le lien de connexion
              </Button>
              {status === "error" && (
                <p className="text-sm text-red-600">
                  Une erreur est survenue, réessayez.
                </p>
              )}
            </form>
          )}
        </div>
      </Container>
    </main>
  );
}
