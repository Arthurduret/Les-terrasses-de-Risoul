import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Client Supabase côté navigateur — utilise uniquement la clé anon publique.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
