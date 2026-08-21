import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-stone-900">Console admin</h1>
      <p className="mt-2 text-stone-600">
        Connecté en tant que {user?.email}. Gestion des disponibilités et
        des tarifs à venir.
      </p>
    </main>
  );
}
