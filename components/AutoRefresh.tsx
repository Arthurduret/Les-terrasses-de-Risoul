"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 60_000;

// Le site n'a pas de mise à jour "poussée" en direct (pas de websocket) :
// une page laissée ouverte ne voit jamais les changements faits ailleurs
// (ex. une date bloquée depuis la console admin dans un autre onglet).
// On imite un rafraîchissement "temps réel" léger, sans infrastructure
// supplémentaire : router.refresh() ne recharge pas la page, il redemande
// juste les données serveur (disponibilités, tarifs) et les injecte dans
// l'arbre React déjà monté — la sélection de dates en cours n'est pas
// perdue. Déclenché quand l'onglet redevient visible, plus un sondage
// périodique en secours si l'onglet reste au premier plan sans jamais
// être quitté.
export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
