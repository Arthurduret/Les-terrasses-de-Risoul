import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Client Supabase côté serveur (Server Components, Server Actions, Route Handlers).
// Utilise la session de l'utilisateur via les cookies — jamais la clé service_role ici.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll appelé depuis un Server Component : ignoré si un
            // middleware se charge par ailleurs de rafraîchir la session.
          }
        },
      },
    }
  );
}

// Client "admin" réservé aux Server Actions / Route Handlers qui ont
// explicitement besoin de contourner les policies RLS (ex: tâches de fond).
// Ne jamais importer ce module depuis un composant client.
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op : ce client n'a pas de session utilisateur à persister
        },
      },
    }
  );
}
