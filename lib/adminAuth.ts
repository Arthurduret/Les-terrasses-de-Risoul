import { createClient } from "./supabase/server";

// Garde-fou explicite en tête de chaque action d'administration.
//
// Deux barrières existent déjà : le middleware redirige /admin vers la page
// de connexion, et les policies RLS refusent l'écriture à un visiteur non
// authentifié. Celle-ci est la troisième, posée au plus près de l'effet de
// bord — une action serveur reste invocable par requête directe, sans
// passer par l'interface, et ne doit pas dépendre du seul routage.
export async function adminClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Action réservée à un administrateur authentifié.");
  }

  return supabase;
}
