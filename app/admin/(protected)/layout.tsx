import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filet de sécurité : le middleware protège déjà /admin, mais on
  // s'assure qu'aucune page admin ne s'affiche sans session valide.
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-full flex-1 bg-background">
      <header className="border-b border-foreground/10 bg-anthracite-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/admin" className="font-display text-lg text-foreground">
            Console admin
          </Link>
          <AdminNav />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-mist-500 hover:text-foreground"
            >
              Voir le site
            </Link>
            <span className="hidden text-sm text-mist-600 sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </div>
  );
}
