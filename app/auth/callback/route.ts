import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Le lien magique redirige ici avec un ?code= à échanger contre une
// session (flux PKCE de Supabase Auth) avant d'atteindre /admin — sans
// cette étape, getUser() ne voit jamais de session et /admin renvoie
// systématiquement vers /admin/login.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login`);
}
